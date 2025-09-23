import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-center"
        gutter={10}
        toastOptions={{
          className: "modern-toast",
          style: {
            background:
              "linear-gradient(135deg, rgba(31,41,55,0.85), rgba(55,65,81,0.85))",
            color: "#FFFFFF",
            fontSize: "15px",
            padding: "14px 18px",
            borderRadius: "12px",
            fontWeight: "500",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(8px)",
          },
          success: {
            iconTheme: {
              primary: "#22C55E",
              secondary: "#FFFFFF",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "#FFFFFF",
            },
          },
        }}
      />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>
);
