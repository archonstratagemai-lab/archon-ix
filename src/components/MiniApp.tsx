import React from "react";
import { MiniAppMainButton } from "./MiniAppMainButton";

/**
 * Simple wrapper that demonstrates the Telegram Mini App MainButton.
 * In a real Telegram Mini App, the button would appear as a native UI
 * element at the bottom of the screen. Here we just hook up a click
 * handler that logs to the console – replace with your own action.
 */
export const MiniApp: React.FC = () => {
  const handleClick = () => {
    // Example action – in production you might navigate, invoke a contract,
    // or call a backend endpoint.
    console.log("Mini App MainButton clicked");
    // You could also call the Telegram SDK to perform native actions.
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Telegram Mini App Demo</h2>
      <p className="mb-4">
        This button lives in the Telegram UI (MainButton). Click it to trigger the handler.
      </p>
      <MiniAppMainButton onClick={handleClick} />
    </div>
  );
};
