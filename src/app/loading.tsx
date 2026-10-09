export default function Loading() {
  return (
    <div className="container section" role="status" aria-label="Loading page">
      <div
        className="skeleton"
        style={{ height: 25, width: "25%", marginBottom: 30 }}
      />
      <div
        className="skeleton"
        style={{ height: 80, width: "70%", marginBottom: 40 }}
      />
      <div className="skeleton" style={{ height: 400 }} />
    </div>
  );
}
