import { useEffect } from "react";

import licenseText from "../../LICENSE?raw";

function licenseParagraphs(raw: string): string[] {
  const blocks = raw
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\n/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (blocks[0]?.toLowerCase() === "mit license") {
    return blocks.slice(1);
  }
  return blocks;
}

interface LicenseDialogProps {
  onClose: () => void;
}

export function LicenseDialog({ onClose }: LicenseDialogProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div
        className="flex w-full max-w-lg flex-col rounded-lg border border-border bg-surface shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="license-dialog-title"
      >
        <div className="border-b border-border px-4 py-3">
          <h2 id="license-dialog-title" className="text-sm font-semibold text-foreground">
            MIT License
          </h2>
        </div>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto px-4 py-3 text-left text-sm text-muted">
          {licenseParagraphs(licenseText).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="flex justify-end border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-surface-hover px-3 py-1.5 text-sm text-foreground hover:bg-border"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
