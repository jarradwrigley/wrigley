"use client";

import { ReactNode } from "react";

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="mobile-layout mobile-only">
      {/* <div
        style={{
          backgroundColor: "#007bff",
          color: "white",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "8px",
        }}
      >
        📱 Mobile View
      </div> */}
      {children}
    </div>
  );
}
