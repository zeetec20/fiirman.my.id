import type React from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface DocumentLayoutProps {
  children: React.ReactNode;
  pageNumber?: string;
  documentTitle?: string;
}

export function DocumentLayout({
  children,
  pageNumber,
  documentTitle,
}: DocumentLayoutProps) {
  return (
    <div className="min-h-screen py-4 sm:py-8 md:py-10 px-3 sm:px-6 flex justify-center items-start">
      {/* Compact Editorial Layout without heavy boxiness */}
      <div className="w-full max-w-4xl px-4 sm:px-8 py-4 relative">
        {/* Newspaper Masthead & Navigation */}
        <Header />

        {/* Optional Folio Meta if provided */}
        {(pageNumber || documentTitle) && (
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--ink-muted)] pb-1.5 mb-6 uppercase tracking-widest select-none">
            <span>{documentTitle}</span>
            <span>{pageNumber}</span>
          </div>
        )}

        {/* Page Content */}
        <main className="mt-4 mb-8">{children}</main>

        {/* Editorial Archival Footer */}
        <Footer />
      </div>
    </div>
  );
}
