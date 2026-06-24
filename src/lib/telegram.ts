import WebApp from "@twa-dev/sdk";

/**
 * Narrowed shape of the Telegram Mini App `BackButton` so we can coalesce
 * to a no-op stub outside Telegram without dragging `any` around.
 */
type BackButtonLike = {
  show: () => void;
  hide: () => void;
  onClick: (cb: () => void) => void;
};

// @twa-dev/sdk's default export is `window.Telegram.WebApp`, which is
// `undefined` when this module is loaded outside Telegram (Vite dev in a
// plain browser, or before Telegram injects `window.Telegram`). Coalesce
// to a stub so `tg.BackButton.show()` etc. are always callable.
const stubBackButton: BackButtonLike = {
  show: () => {},
  hide: () => {},
  onClick: () => {},
};

// Cast through `unknown` so we can probe `.BackButton` without `any`.
const webApp = WebApp as unknown as { BackButton?: BackButtonLike } | undefined;

export const tg = {
  BackButton: webApp?.BackButton ?? stubBackButton,
  // Telegram Mini App MainButton (primary action button). Provide a stub when not in Telegram.
  MainButton: (webApp as any)?.MainButton ?? {
    show: () => {},
    hide: () => {},
    isVisible: false,
    setText: (_: string) => {},
    onClick: (cb: () => void) => {},
    offClick: (cb?: () => void) => {},
  },
};

// Preserved for any future fallback consumers.
export const tgFallback = { BackButton: stubBackButton, MainButton: {
  show: () => {},
  hide: () => {},
  isVisible: false,
  setText: (_: string) => {},
  onClick: (cb: () => void) => {},
  offClick: (cb?: () => void) => {},
} };