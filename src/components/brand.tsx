import Image from "next/image";
import Link from "next/link";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Drishyam Realty home">
      <Image
        src="/logo.png"
        width={118}
        height={79}
        alt="Official Drishyam Realty logo"
        loading="eager"
        fetchPriority="high"
      />
      <span className="brand-tagline">MAKING YOUR VISUALIZATION REAL</span>
    </Link>
  );
}
