import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

interface LightboxProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog, e.g. `Maximized view of foo.png`. */
  label: string;
  /** Title-bar content shown to the left of the close button. */
  header: ReactNode;
  children: ReactNode;
  /** `::backdrop` utilities — set per call site so each lightbox keeps its own dim level. */
  backdropClassName?: string;
}

/**
 * Image lightbox built on the native `<dialog>` element.
 *
 * `showModal()` puts the element in the browser's top layer, which buys us for
 * free what the previous hand-rolled `role="dialog"` wrapper had to fake:
 * focus trapping, Escape-to-close, an inert background, a styleable
 * `::backdrop`, and focus restoration to the trigger on close.
 *
 * The two things `<dialog>` genuinely does NOT do are handled explicitly below:
 * page scroll locking, and closing on a backdrop click.
 */
export function Lightbox({
  open,
  onClose,
  label,
  header,
  children,
  backdropClassName = "backdrop:bg-black/40 dark:backdrop:bg-black/60 backdrop:backdrop-blur-xs",
}: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Read the latest callback without re-running the modal lifecycle effect.
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Every close path (Escape, backdrop click, close button) funnels through
    // the native `close` event, so React state and the dialog never disagree.
    const handleNativeClose = () => onCloseRef.current();

    // Clicks landing on the dimmed `::backdrop` are dispatched against the
    // dialog element itself, so a self-target means "clicked outside the card".
    // Bound natively for the same reason as `close`: `<dialog>` already supplies
    // the keyboard equivalent (Escape), so this is a pointer-only convenience.
    const handleBackdropClick = (event: Event) => {
      if (event.target === dialog) dialog.close();
    };

    dialog.addEventListener("click", handleBackdropClick);

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }

    dialog.addEventListener("close", handleNativeClose);
    return () => {
      dialog.removeEventListener("click", handleBackdropClick);
      dialog.removeEventListener("close", handleNativeClose);
    };
  }, [open]);

  // <dialog> does not lock page scroll, so keep that behaviour deliberately.
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      className={`fixed inset-0 z-50 open:flex items-center justify-center p-3 sm:p-5 md:p-6 m-0 w-full h-full max-w-none max-h-none bg-transparent border-0 text-inherit animate-fade-in ${backdropClassName}`}
    >
      <div className="relative z-10 max-w-5xl lg:max-w-6xl w-full max-h-[92vh] flex flex-col rounded-xs overflow-hidden backdrop-blur-xl bg-white/40 dark:bg-stone-950/40 border border-black/[0.07] dark:border-white/[0.1] shadow-smooth-lg ring-1 ring-black/5 dark:ring-white/5 cursor-default">
        <div className="w-full flex items-center justify-between gap-3 px-4 py-2.5 border-b border-black/[0.07] dark:border-white/[0.1] backdrop-blur-md bg-white/20 dark:bg-white/[0.03] font-mono select-none">
          <div className="flex items-center gap-2 min-w-0">{header}</div>

          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close image modal"
            className="p-1 rounded-xs hover:bg-black/5 dark:hover:bg-white/10 text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {children}
      </div>
    </dialog>
  );
}