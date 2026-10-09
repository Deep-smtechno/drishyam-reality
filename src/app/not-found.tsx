import Link from "next/link";
export default function NotFound() {
  return (
    <div className="error-page">
      <span className="eyebrow">A DIFFERENT PATH</span>
      <h1>
        Let’s find your <em>way back.</em>
      </h1>
      <p>This page or property is no longer available.</p>
      <Link href="/buy-properties" className="button button-navy">
        Explore Properties
      </Link>
    </div>
  );
}
