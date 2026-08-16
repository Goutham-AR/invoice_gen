import Link from "next/link";
import NavBar from "@/components/NavBar";
import { groupedRegistry } from "@/lib/formats/registry";

export default function DocsIndex() {
  const groups = groupedRegistry();

  return (
    <>
      <NavBar />
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-10">
        <header>
          <h1 className="text-2xl font-semibold">Format Reference</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Field definitions, business rules, and a reference sample for every supported format
            and variant.
          </p>
        </header>

        {groups.map((g) => (
          <section key={g.formatType}>
            <h2 className="text-lg font-medium mb-3">{g.formatType.toUpperCase()}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {g.modules.map((m) => (
                <Link
                  key={m.id}
                  href={`/docs/${m.formatType}/${m.id}`}
                  className="border rounded-md p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                  <div className="font-medium">{m.label}</div>
                  <p className="text-sm text-neutral-500 mt-1">{m.description}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
