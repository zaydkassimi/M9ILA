import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <Image
          src="/images/navbar%20-%20dark%20(transparent)@4x.png"
          alt="M9ila Logo"
          width={120}
          height={40}
          className="h-10 w-auto object-contain mx-auto mb-8"
          style={{ objectFit: "contain" }}
        />
        <h1 className="text-8xl font-black text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Cette page n&apos;existe pas.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-primary text-white font-bold rounded-full shadow-xl hover:bg-primary/90 transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
