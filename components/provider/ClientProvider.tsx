"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { Toaster } from "sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AddAircraftModal } from "../aircraft/add-aircraft-modal";
import { EditAircraftModal } from "../aircraft/edit-aircraft-modal";
import { ViewAircraftModal } from "../aircraft/view-aircraft-modal";

const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
      <AddAircraftModal />
      <EditAircraftModal />
      <ViewAircraftModal />
    </QueryClientProvider>
  );
};

export default ClientProvider;
