import { supabase } from "../supabaseClient";
import { Context, Asset, UploadTicket, DownloadLink } from "../types";
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";

const EDGE_FUNCTION_URL =
  process.env.EDGE_FUNCTION_URL ||
  "http://localhost:54321/functions/v1/hash-object";

async function fetchEdgeFunction(
  storagePath: string
): Promise<{ sha256: string; size: number }> {
  const res = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storagePath }),
  });
  if (!res.ok) throw new Error("Edge function failure");
  return await res.json();
} // FIX: closed function

export const resolvers = {
  Asset: {
    id: (parent: any) => String(parent.id ?? parent.assetid ?? ""),
    filename: (parent: any) => parent.filename ?? parent.name ?? "unknown",
    mime: (parent: any) => parent.mime ?? parent.type ?? "application/octet-stream",
    size: (parent: any) => parent.size ?? 0,
    sha256: (parent: any) => parent.sha256 ?? null,
    status: (parent: any) => parent.status ?? "ready",
    version: (parent: any) => parent.version ?? 1,
    createdAt: (parent: any) => parent.createdAt ?? parent.created_at ?? new Date(0).toISOString(),
    updatedAt: (parent: any) => parent.updatedAt ?? parent.updated_at ?? new Date(0).toISOString(),
  },
  Query: {
    assets: async (
      _parent: unknown,
      _args: unknown,
      _context: Context
    ): Promise<Asset[]> => {
      try {
        const { data, error } = await supabase.from("asset").select("*");
        if (error) throw error;
        return (data || []) as Asset[];
      } catch (err: any) {
        const message = String(err?.message || err);
        // Supabase/PostgREST missing relation/table
        if (message.includes("does not exist") || message.includes("relation") || message.includes("resource")) {
          return [];
        }
        throw err;
      }
    },

    asset: async (
      _parent: unknown,
      { id }: { id: string },
      _context: Context
    ): Promise<Asset> => {
      try {
        const { data, error } = await supabase
          .from("asset")
          .select("*")
          .eq("id", id)
          .single();
        if (error || !data) throw new Error("NOT_FOUND");
        return data as Asset;
      } catch (err: any) {
        const message = String(err?.message || err);
        if (message.includes("does not exist") || message.includes("relation") || message.includes("resource")) {
          throw new Error("NOT_FOUND");
        }
        throw err;
      }
    },
  },

  Mutation: {
    createUploadUrl: async (
      _parent: unknown,
      { filename, mime, size }: { filename: string; mime: string; size: number },
      context: Context
    ): Promise<{
      assetId: string;
      storagePath: string;
      uploadUrl: string;
      expiresAt: string;
      nonce: string;
    }> => {
      if (!context.user?.id) throw new Error("UNAUTHENTICATED");
      const userId = context.user.id;

      const assetId = uuidv4();
      const nonce = uuidv4();
      const storagePath = `user_uploads/${userId}/${assetId}-${filename}`;

      await supabase.from("asset").insert({
        id: assetId,
        ownerid: userId,
        filename,
        mime,
        size,
        storagepath: storagePath,
        status: "draft",
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      await supabase.from("uploadticket").insert({
        assetid: assetId,
        userid: userId,
        nonce,
        mime,
        size,
        storagepath: storagePath,
        expiresat: expiresAt,
        used: false,
      });

      // Ensure storage bucket exists; create if missing then retry
      let signedUrl: string | undefined;
      try {
        const { data, error } = await supabase.storage
          .from("user-uploads")
          .createSignedUploadUrl(storagePath);
        if (error) throw error;
        signedUrl = data.signedUrl;
      } catch (err: any) {
        const message = String(err?.message || err);
        if (message.includes("does not exist") || message.includes("resource") || err?.status === 404) {
          // Attempt to create the bucket, then retry once
          await supabase.storage.createBucket("user-uploads", { public: false });
          const retry = await supabase.storage
            .from("user-uploads")
            .createSignedUploadUrl(storagePath);
          if (retry.error) throw retry.error;
          signedUrl = retry.data.signedUrl;
        } else {
          throw err;
        }
      }

      return {
        assetId,
        storagePath,
        uploadUrl: signedUrl!,
        expiresAt,
        nonce,
      };
    },

    finalizeUpload: async (
      _parent: unknown,
      {
        assetId,
        clientSha256,
        version,
      }: { assetId: string; clientSha256: string; version: number },
      context: Context
    ): Promise<Asset> => {
      if (!context.user?.id) throw new Error("UNAUTHENTICATED");
      const userId = context.user.id;

      const { data: asset, error } = await supabase
        .from("asset")
        .select("*")
        .eq("id", assetId)
        .eq("ownerid", userId)
        .single();

      if (error || !asset) throw new Error("NOT_FOUND");
      if (asset.version !== version) throw new Error("VERSIONCONFLICT");

      const { sha256 } = await fetchEdgeFunction(asset.storagepath);

      if (sha256 !== clientSha256) {
        await supabase
          .from("asset")
          .update({ status: "corrupt", updatedAt: new Date().toISOString() })
          .eq("id", assetId);
        throw new Error("INTEGRITY_FAILED");
      } // FIX: close integrity block

      const newVersion = version + 1;
      await supabase
        .from("asset")
        .update({
          sha256: clientSha256,
          status: "ready",
          version: newVersion,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", assetId);

      return {
        ...(asset as Asset),
        sha256: clientSha256,
        status: "ready",
        version: newVersion,
        updatedAt: new Date().toISOString(),
      } as Asset;
    },

    getDownloadUrl: async (
      _parent: unknown,
      { assetId }: { assetId: string },
      context: Context
    ): Promise<DownloadLink> => {
      if (!context.user?.id) throw new Error("UNAUTHENTICATED");
      const userId = context.user.id;

      const { data: asset, error } = await supabase
        .from("asset")
        .select("*")
        .eq("id", assetId)
        .single();

      if (error || !asset) throw new Error("NOT_FOUND");

      if (asset.ownerid !== userId) {
        const { count, error: err } = await supabase
          .from("assetshare")
          .select("*", { count: "exact" })
          .eq("assetid", assetId)
          .eq("touser", userId)
          .eq("candownload", true);

        if (err) throw err;
        if (!count) throw new Error("FORBIDDEN");
      }

      const { data, error: downloadErr } = await supabase.storage
        .from("user-uploads")
        .createSignedUrl(asset.storagepath, 90);
      if (downloadErr) throw downloadErr;

      await supabase.from("downloadaudit").insert({
        assetid: assetId,
        userid: userId,
      });

      return {
        url: data.signedUrl,
        expiresAt: new Date(Date.now() + 90 * 1000).toISOString(),
      };
    },

    renameAsset: async (
      _parent: unknown,
      {
        assetId,
        newFilename,
        version,
      }: { assetId: string; newFilename: string; version: number },
      context: Context
    ): Promise<Asset> => {
      if (!context.user?.id) throw new Error("UNAUTHENTICATED");
      const userId = context.user.id;

      const { data: asset, error } = await supabase
        .from("asset")
        .select("*")
        .eq("id", assetId)
        .eq("ownerid", userId)
        .single();

      if (error || !asset) throw new Error("NOT_FOUND");
      if (asset.version !== version) throw new Error("VERSIONCONFLICT");

      await supabase
        .from("asset")
        .update({
          filename: newFilename,
          version: version + 1,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", assetId);

      return {
        ...(asset as Asset),
        filename: newFilename,
        version: version + 1,
        updatedAt: new Date().toISOString(),
      } as Asset;
    },

    shareAsset: async (
      _parent: unknown,
      {
        assetId,
        toUserId,
        canDownload,
      }: { assetId: string; toUserId: string; canDownload: boolean },
      context: Context
    ): Promise<boolean> => {
      if (!context.user?.id) throw new Error("UNAUTHENTICATED");
      const userId = context.user.id;

      const { count, error } = await supabase
        .from("asset")
        .select("*", { count: "exact" })
        .eq("id", assetId)
        .eq("ownerid", userId);

      if (error) throw error;
      if (!count) throw new Error("FORBIDDEN");

      await supabase
        .from("assetshare")
        .upsert({ assetid: assetId, touser: toUserId, candownload: canDownload });

      return true;
    },
  },
};
