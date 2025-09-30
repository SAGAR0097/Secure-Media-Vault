import React, { useState, useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "./supabaseClient";
import { useQuery, useMutation, gql } from "@apollo/client";

// GraphQL
const GET_ASSETS = gql`
  query GetAssets {
    assets {
      id
      filename
      status
      version
    }
  }
`;

const CREATE_UPLOAD_URL = gql`
  mutation CreateUploadUrl($filename: String!, $mime: String!, $size: Int!) {
    createUploadUrl(filename: $filename, mime: $mime, size: $size) {
      assetId
      uploadUrl
    }
  }
`;

// Types
interface Asset {
  id: string;
  filename: string;
  status: string;
  version: string;
}
interface GetAssetsData {
  assets: Asset[];
}
interface CreateUploadUrlData {
  createUploadUrl: {
    assetId: string;
    uploadUrl: string;
  };
}
interface CreateUploadUrlVars {
  filename: string;
  mime: string;
  size: number;
}

// Safe JSON stringify for circular structures
function getCircularReplacer() {
  const ancestors: any[] = [];
  return function (_key: string, value: any) {
    if (typeof value !== "object" || value === null) return value;
    while (ancestors.length && ancestors.at(-1) !== this) ancestors.pop();
    if (ancestors.includes(value)) return "[Circular]";
    ancestors.push(value);
    return value;
  };
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  // Supabase auth session handling
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    cleanup = () => {
      // onAuthStateChange returns { data: { subscription } } in current SDKs
      sub?.subscription?.unsubscribe?.();
      // older SDKs: sub?.unsubscribe?.();
    };

    return () => cleanup?.();
  }, []);

  // Query assets when logged in
  const { data, loading, error, refetch } = useQuery<GetAssetsData>(GET_ASSETS, {
    fetchPolicy: "network-only",
    skip: !session,
    notifyOnNetworkStatusChange: true,
  });

  const [createUploadUrl] =
    useMutation<CreateUploadUrlData, CreateUploadUrlVars>(CREATE_UPLOAD_URL);

  // File selection
  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  // Upload a single file via pre-signed PUT
  const uploadFile = async (file: File) => {
    // Important: the MIME must match what backend used to sign
    const contentType = file.type || "application/octet-stream";

    try {
      const { data } = await createUploadUrl({
        variables: {
          filename: file.name,
          mime: contentType,
          size: file.size,
        },
      });

      if (!data?.createUploadUrl?.uploadUrl) {
        throw new Error("No upload URL returned");
      }

      const { uploadUrl } = data.createUploadUrl;

      const resp = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
          // For S3-style URLs, do NOT add custom headers unless they were signed
        },
        body: file,
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(
          `Upload failed: ${resp.status} ${resp.statusText} ${text}`.trim()
        );
      }

      console.log(`Uploaded ${file.name} successfully.`);
      setNotice(`Uploaded ${file.name} successfully.`);
    } catch (err) {
      console.error("Upload failed:", err);
      alert(`Upload failed for ${file.name}`);
      throw err; // allow upstream to stop sequence if needed
    }
  };

  // Upload all files sequentially
  const handleUploadAll = async () => {
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        await uploadFile(file);
      }
      setFiles([]);
      await refetch?.();
    } finally {
      setUploading(false);
    }
  };

  if (!session) {
    return (
      <div style={{ maxWidth: 400, margin: "auto", paddingTop: 50 }}>
        <Auth supabaseClient={supabase} />
      </div>
    );
  }

  if (error) {
    console.error("Apollo query error:", error);
    return (
      <div style={{ color: "red", maxWidth: 600, margin: "auto" }}>
        <p>Error loading assets: {error.message}</p>
        <details style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(
            {
              graphQLErrors: error.graphQLErrors?.map((e) => ({
                message: e.message,
                path: e.path,
                code: e.extensions?.code,
              })),
              networkError: {
                message: (error as any)?.networkError?.message,
                statusCode: (error as any)?.networkError?.statusCode,
                resultErrors: (error as any)?.networkError?.result?.errors,
              },
            },
            getCircularReplacer(),
            2
          )}
        </details>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "auto", paddingTop: 20 }}>
      <h1>Secure Media Vault</h1>
      {notice && (
        <div className="success" role="status" aria-live="polite" style={{ margin: "10px 0" }}>
          {notice}
        </div>
      )}

      <input type="file" multiple onChange={onFilesSelected} />
      <button
        onClick={handleUploadAll}
        disabled={uploading || files.length === 0}
        style={{ marginLeft: 10 }}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {loading && <p>Loading assets...</p>}
      {!loading && !data?.assets?.length && <p>No assets found.</p>}

      <ul>
        {data?.assets?.map((asset: Asset) => (
          <li key={asset.id}>
            {asset.filename} - {asset.status}
          </li>
        ))}
      </ul>

      <button
        onClick={() => supabase.auth.signOut()}
        style={{ marginTop: 20 }}
      >
        Sign Out
      </button>
    </div>
  );
}

export default App;
