"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="error-page">
      <span className="eyebrow">A MOMENT PLEASE</span>
      <h1>
        Let’s try <em>again.</em>
      </h1>
      <p>We couldn’t load this page. Please try once more.</p>
      <button className="button button-navy" onClick={reset}>
        Try Again
      </button>
    </div>
  );
}
