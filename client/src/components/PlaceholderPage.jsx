export default function PlaceholderPage({ title, description }) {
  return (
    <section className="card">
      <h2 style={{ marginBottom: "8px" }}>{title}</h2>
      <p className="section-sub">{description}</p>
    </section>
  );
}