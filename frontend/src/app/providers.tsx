"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store/store";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster
          position="bottom-right"
          richColors={false}
          closeButton
          toastOptions={{
            classNames: {
              toast: "group toast border border-border/60 bg-card/75 backdrop-blur-md text-foreground rounded-xl shadow-lg p-3.5 flex gap-2.5 items-center font-sans",
              description: "text-muted-foreground text-xs",
              actionButton: "bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg",
              cancelButton: "bg-muted text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-lg",
              success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              error: "border-destructive/20 bg-destructive/10 text-destructive dark:text-red-400",
              warning: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
              info: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
            },
          }}
        />
      </ThemeProvider>
    </Provider>
  );
}

