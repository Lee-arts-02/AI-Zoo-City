import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Shared Zoo City — AI Zoo City",
  description: "Experience a friend’s redesigned Zoo City model.",
};

export default function ShareLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-amber-100/90 to-orange-50">
      {children}
    </div>
  );
}
