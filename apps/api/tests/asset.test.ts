import { createTestClient } from "graphql-yoga";
// TODO: adjust import to your server entry
// import { server } from "../src/server";

describe("Asset version conflict", () => {
  it("should throw VERSION_CONFLICT when renaming with stale version", async () => {
    // 1. Create an asset (via mutation)
    // 2. Rename asset in one "tab"
    // 3. Try renaming again with stale version
    // 4. Expect GraphQL error with extensions.code = "VERSION_CONFLICT"
  });
});

describe("Finalize upload integrity", () => {
  it("should mark asset as corrupt when hash mismatches", async () => {
    // 1. Request upload ticket
    // 2. Upload dummy file
    // 3. Call finalizeUpload with wrong clientSha256
    // 4. Expect asset.status === "corrupt" and error
  });
});


