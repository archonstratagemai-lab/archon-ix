const services = [
  {
    title: "Strategic Intelligence",
    desc: "AI-powered market analysis and strategic insights tailored to your portfolio and sovereign objectives.",
  },
  {
    title: "Legacy Architecture",
    desc: "Multi-generational wealth structuring, trust frameworks, and digital asset succession planning.",
  },
  {
    title: "Sovereign Operations",
    desc: "Privacy-first infrastructure, decentralized identity management, and jurisdictional optimization.",
  },
  {
    title: "Token Engineering",
    desc: "Custom tokenomics design, governance frameworks, and protocol-level incentive alignment.",
  },
  {
    title: "Neural Commerce",
    desc: "AI-driven transaction optimization, MEV protection, and cross-chain execution routing.",
  },
  {
    title: "Imperial Protocol",
    desc: "End-to-end protocol deployment, auditing, and ecosystem bootstrapping for sovereign entities.",
  },
];

export default function Services() {
  return (
    <section className="services" id="services">
      <div className="container">
        <h2>Core Services</h2>
        <div className="service-grid">
          {services.map((s) => (
            <div className="service-card" key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
