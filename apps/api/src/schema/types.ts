import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Asset {
    id: String!
    filename: String!
    mime: String!
    size: Int!
    sha256: String
    status: String!
    version: Int!
    createdAt: String!
    updatedAt: String!
  }

  type UploadTicket {
    assetId: String!
    storagePath: String!
    uploadUrl: String!
    expiresAt: String!
    nonce: String!
  }

  type DownloadLink {
    url: String!
    expiresAt: String!
  }

  type Query {
    assets: [Asset!]!
    asset(id: String!): Asset
  }

  type Mutation {
    createUploadUrl(filename: String!, mime: String!, size: Int!): UploadTicket!
    finalizeUpload(assetId: String!, clientSha256: String!, version: Int!): Asset!
    getDownloadUrl(assetId: String!): DownloadLink!
    renameAsset(assetId: String!, newFilename: String!, version: Int!): Asset!
    shareAsset(assetId: String!, toUserId: String!, canDownload: Boolean!): Boolean!
  }
`;
