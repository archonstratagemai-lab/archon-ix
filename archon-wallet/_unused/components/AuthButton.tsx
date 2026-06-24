/**
 * Authentication button for the ARCHON‑IX Sovereign Wallet.
 * Uses Account Kit hooks to sign‑in/out via Email OTP, Google OAuth, or Passkey.
 */

import React from "react";
import { useAccountKit } from "@account-kit/react";

export const AuthButton: React.FC = () => {
  const { isAuthenticated, user, login, logout, loading } = useAccountKit();

  if (loading) {
    return <div className="p-2 text-gray-500">Loading…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex space-x-2">
        {/* Email OTP */}
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => login({ method: "emailOTP" })}
        >
          Sign in with Email
        </button>
        {/* Google OAuth */}
        <button
          className="px-4 py-2 bg-red-600 text-white rounded"
          onClick={() => login({ method: "googleOAuth" })}
        >
          Sign in with Google
        </button>
        {/* Passkey – automatically shown if supported */}
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded"
          onClick={() => login({ method: "passkey" })}
        >
          Sign in with Passkey
        </button>
      </div>
    );
  }

  // Authenticated UI – show avatar, short address, logout.
  const shortAddr = user?.address
    ? `${user.address.slice(0, 6)}…${user.address.slice(-4)}`
    : "";

  return (
    <div className="flex items-center space-x-3">
      {user?.avatar && (
        // Account Kit provides an avatar URL when available.
        <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
      )}
      <span className="font-mono text-sm">{shortAddr}</span>
      <button
        className="px-3 py-1 bg-gray-200 text-gray-800 rounded"
        onClick={() => logout()}
      >
        Disconnect
      </button>
    </div>
  );
};
