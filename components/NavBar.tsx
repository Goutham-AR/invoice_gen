import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="border-b px-6 py-3 flex gap-6 text-sm">
      <Link href="/" className="font-semibold">
        Invoice Fixture Generator
      </Link>
      <Link href="/" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
        Generator
      </Link>
      <Link href="/docs" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
        Format Docs
      </Link>
    </nav>
  );
}
