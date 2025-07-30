"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import useSeller from "../hooks/useSeller";
import { WebSocketProvider } from "../context/websocket-context";
import { Toaster } from "react-hot-toast";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000,
          },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ProvidersWithWebSocket>{children}</ProvidersWithWebSocket>
      <Toaster />
    </QueryClientProvider>
  );
};

const ProvidersWithWebSocket = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { seller, isLoading } = useSeller();
  // if(isLoading) return null;
  return (
    <>
      {seller && (
        <WebSocketProvider seller={seller}>{children}</WebSocketProvider>
      )}
      {!seller && children}
    </>
  );
};

export default Providers;
