const stats = [
  { number: "500+", label: "Members" },
  { number: "12", label: "Services" },
  { number: "99.9%", label: "Uptime" },
  { number: "24/7", label: "Access" },
];

export default function Stats() {
  return (
    <section className="stats">
      <div className="container">
        {stats.map((s) => (
          <div className="stat-item" key={s.label}>
            <span className="stat-number">{s.number}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
