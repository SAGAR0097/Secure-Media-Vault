import { createServer } from "@graphql-yoga/node";
import { supabase } from "./supabaseClient"; 
import { typeDefs } from "./schema/types";
import { resolvers } from "./resolvers";
import dotenv from "dotenv";
dotenv.config();

const server = createServer({
  maskedErrors: false,
  cors: {
    // In dev, allow all origins to avoid port mismatches (5173/5177/etc.)
    origin: process.env.WEB_ORIGIN || "*",
    credentials: false,
    allowedHeaders: ["content-type", "authorization"],
    methods: ["POST", "GET", "OPTIONS"],
  },
  schema: {
    typeDefs,
    resolvers,
  },
  context: async ({ request }) => {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return { user: null };
    }

    // Verify supabase JWT token and get user info
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { user: null };
    }

    // Return context with authenticated user
    return {
      user: { id: user.id, email: user.email },
    };
  },
});

async function run() {
  await server.start();
  console.log("GraphQL API running at http://localhost:4000");
}

run();
