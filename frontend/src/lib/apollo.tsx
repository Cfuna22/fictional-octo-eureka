import { ApolloProvider, ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://shcicocyypihgcnwfhks.supabase.co/graphql/v1",
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as String,
      authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY!}`,
    },
  }),
  cache: new InMemoryCache(),
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
  
}
