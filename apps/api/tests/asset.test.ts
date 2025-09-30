/**
 * Secure Media Vault – Rubric Tests
 *
 * Place this file in: apps/api/tests/asset.test.ts
 * Run with: pnpm test (from apps/api)
 */

import { createTestClient } from "graphql-yoga/testing";
import { schema } from "../src/schema"; // adjust if schema entrypoint differs

// Create GraphQL client
const client = createTestClient({ schema });

// Helper: create a new test asset
async function createTestAsset() {
  const { data, errors } = await client.mutate(`
    mutation {
      createUploadUrl(filename: "test.jpg", mime: "image/jpeg", size: 123) {
        assetId
      }
    }
  `);

  if (errors) {
    throw new Error(`createUploadUrl failed: ${JSON.stringify(errors)}`);
  }

  return { id: data.createUploadUrl.assetId, version: 1 };
}

describe("Secure Media Vault – Rubric Compliance", () => {
  it("should return VERSION_CONFLICT on concurrent rename", async () => {
    const asset = await createTestAsset();
    const v = asset.version;

    // Two rename mutations with same version
    const rename1 = client.mutate(`
      mutation {
        renameAsset(assetId: "${asset.id}", filename: "a.jpg", version: ${v}) {
          id
          filename
        }
      }
    `);

    const rename2 = client.mutate(`
      mutation {
        renameAsset(assetId: "${asset.id}", filename: "b.jpg", version: ${v}) {
          id
          filename
        }
      }
    `);

    const [res1, res2] = await Promise.allSettled([rename1, rename2]);

    // Expect one to succeed
    expect(res1.status === "fulfilled" || res2.status === "fulfilled").toBe(true);

    // Expect the other to fail with VERSION_CONFLICT
    const conflict =
      res1.status === "rejected" ? (res1 as any).reason : (res2 as any).reason;

    expect((conflict as any)?.extensions?.code).toBe("VERSION_CONFLICT");
  });

  it("should mark asset corrupt on hash mismatch", async () => {
    const asset = await createTestAsset();

    const { data, errors } = await client.mutate(`
      mutation {
        finalizeUpload(assetId: "${asset.id}", clientSha256: "fakehash", version: 1) {
          id
          status
        }
      }
    `);

    expect(errors).toBeUndefined();
    expect(data.finalizeUpload.status).toBe("corrupt");
  });
});


