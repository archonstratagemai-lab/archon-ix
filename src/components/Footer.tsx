export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p className="footer-tagline">
          "Sovereignty is not given. It is architectured."
        </p>
        <p>&copy; {new Date().getFullYear()} ARCHON-IX &mdash; Koda Kinetix Press</p>
        <p style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
          Built on Base &middot; Powered by Alchemy &middot; Verified on-chain
        </p>
      </div>
    </footer>
  );
}
