import { Link } from "@tanstack/react-router";
import { DocumentLayout } from "@/components/DocumentLayout";
import { ScanStamp } from "@/components/ScanStamp";
import { InkLine } from "@/components/ui/ink";

export function NotFoundPage() {
  return (
    <DocumentLayout pageNumber="p. 00/00" documentTitle="FOLIO NON INVENTUM">
      <div className="py-12 sm:py-20 text-center max-w-xl mx-auto space-y-6">
        {/* Archival Scan Stamp */}
        <div className="flex justify-center">
          <ScanStamp label="FOLIO NON INVENTUM // 404" />
        </div>

        {/* Large 404 Headline */}
        <div className="space-y-2">
          <h1 className="font-gothic text-6xl sm:text-7xl md:text-8xl text-[var(--ink-primary)] tracking-normal leading-none drop-shadow-xs select-none">
            404
          </h1>
          <p className="font-serif italic text-lg sm:text-xl text-[var(--ink-secondary)] tracking-wider">
            Lost in the Archives
          </p>
        </div>

        {/* Ink Divider */}
        <div className="w-36 sm:w-48 mx-auto py-2">
          <InkLine />
        </div>

        {/* User Requested Body Description */}
        <div className="space-y-3 font-serif text-[var(--ink-primary)]">
          <p className="text-base sm:text-lg leading-relaxed">
            You are lost, you can come back by pressing the button below.
          </p>
        </div>

        {/* Return to Frontispiece Action Button */}
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xs font-mono text-xs uppercase tracking-widest bg-[var(--accent)] text-[var(--accent-foreground)] font-bold hover:opacity-90 transition-opacity shadow-smooth-md hover:shadow-smooth-lg cursor-pointer"
          >
            <span aria-hidden="true">&larr;</span>
            <span>Return to Frontispiece</span>
          </Link>
        </div>
      </div>
    </DocumentLayout>
  );
}
