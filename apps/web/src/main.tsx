import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { supabase } from "./supabaseClient";  // <-- Import supabase here
import App from "./App";
import "./styles.css";

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || "http://localhost:4000/graphql",
});

// Attach the latest Supabase JWT before each request
const authLink = setContext(async (_, { headers }) => {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token || "";
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  } catch {
    return { headers };
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
