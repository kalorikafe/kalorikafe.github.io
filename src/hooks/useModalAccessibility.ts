import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface ModalStackEntry {
  token: symbol;
  dialogRef: RefObject<HTMLDivElement | null>;
  previousFocus: HTMLElement | null;
  lastFocusedWithin: HTMLElement | null;
}

const modalStack: ModalStackEntry[] = [];
let bodyOverflowBeforeFirstModal = '';

function isTopmostModal(token: symbol) {
  return modalStack.at(-1)?.token === token;
}

function focusFirstElement(dialog: HTMLDivElement | null) {
  const firstFocusable = dialog?.querySelector<HTMLElement>(FOCUSABLE);
  (firstFocusable || dialog)?.focus();
}

function getDialogNode(entry: ModalStackEntry | undefined) {
  return entry?.dialogRef.current ?? null;
}

export function useModalAccessibility(isOpen: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const token = Symbol('modal');
    const currentFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const parentEntry = modalStack.at(-1);
    const parentDialog = getDialogNode(parentEntry);
    const rememberedParentFocus = parentEntry?.lastFocusedWithin;
    const previousFocus = rememberedParentFocus?.isConnected && parentDialog?.contains(rememberedParentFocus)
      ? rememberedParentFocus
      : currentFocus;
    if (modalStack.length === 0) {
      bodyOverflowBeforeFirstModal = document.body.style.overflow;
    }
    document.body.style.overflow = 'hidden';
    const entry: ModalStackEntry = {
      token,
      dialogRef,
      previousFocus,
      lastFocusedWithin: null,
    };
    modalStack.push(entry);

    const rememberTargetWithinDialog = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLElement && dialogRef.current?.contains(target)) {
        entry.lastFocusedWithin = target;
      }
    };
    document.addEventListener('focusin', rememberTargetWithinDialog);
    document.addEventListener('pointerdown', rememberTargetWithinDialog);

    const focusTimer = window.setTimeout(() => {
      if (!isTopmostModal(token)) return;

      // Do not let an older dialog's deferred autofocus steal focus from a
      // control the user has already reached inside that dialog. This can
      // happen when that control immediately launches a lazy-loaded child
      // dialog before the first timer has fired.
      const dialog = dialogRef.current;
      const activeElementIsInside = document.activeElement instanceof Node && dialog?.contains(document.activeElement);
      const rememberedElementIsInside = entry.lastFocusedWithin?.isConnected && dialog?.contains(entry.lastFocusedWithin);
      if (activeElementIsInside || rememberedElementIsInside) return;
      focusFirstElement(dialog);
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isTopmostModal(token)) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
        .filter(element => element.offsetParent !== null);
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!dialogRef.current.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', rememberTargetWithinDialog);
      document.removeEventListener('pointerdown', rememberTargetWithinDialog);

      const entryIndex = modalStack.findIndex(entry => entry.token === token);
      const wasTopmost = entryIndex === modalStack.length - 1;
      if (entryIndex >= 0) modalStack.splice(entryIndex, 1);

      if (modalStack.length === 0) {
        document.body.style.overflow = bodyOverflowBeforeFirstModal;
        if (previousFocus?.isConnected) previousFocus.focus();
        return;
      }

      // When a nested dialog closes, return focus to its trigger inside the
      // underlying dialog. If that trigger disappeared, focus the underlying
      // dialog itself so keyboard users never fall back to the page behind it.
      if (wasTopmost) {
        const nextTopmost = modalStack.at(-1);
        const nextDialog = getDialogNode(nextTopmost);
        if (previousFocus?.isConnected && nextDialog?.contains(previousFocus)) {
          previousFocus.focus();
        } else {
          focusFirstElement(nextDialog);
        }
      }
    };
  }, [isOpen]);

  return dialogRef;
}
