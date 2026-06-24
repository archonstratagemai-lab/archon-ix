import React, { useEffect } from "react";
import { tg } from "../lib/telegram";

/**
 * Demonstrates the Telegram Mini App `MainButton`. When running inside
 * Telegram this displays a primary button at the bottom of the mini-app
 * shell; outside Telegram the stub in `src/lib/telegram.ts` makes the
 * calls no-ops so the component is safe to mount unconditionally.
 *
 * The component renders nothing — the button lives in the Telegram UI.
 */
export const MiniAppMainButton: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => {
  useEffect(() => {
    try {
      tg.MainButton.show();
      // @ts-ignore — the Telegram stub coalesces to `any`; `setText`
      // exists at runtime even when the local typing loses it.
      tg.MainButton.setText("Start");
      tg.MainButton.onClick(onClick);
      return () => {
        tg.MainButton.hide();
        // `offClick` is a safe no-op on the stub outside Telegram.
        tg.MainButton.offClick(onClick);
      };
    } catch {
      // Outside Telegram the stub methods throw/ignore silently.
      return undefined;
    }
  }, [onClick]);

  return null;
};
