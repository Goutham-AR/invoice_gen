import { notFound } from "next/navigation";
import NavBar from "@/components/NavBar";
import FieldTable from "@/components/docs/FieldTable";
import RulesMarkdown from "@/components/docs/RulesMarkdown";
import SampleViewer from "@/components/docs/SampleViewer";
import { registry, getModule } from "@/lib/formats/registry";

export function generateStaticParams() {
  return registry.map((m) => ({ type: m.formatType, variant: m.id }));
}

export default async function VariantDocsPage({
  params,
}: {
  params: Promise<{ type: string; variant: string }>;
}) {
  const { type, variant } = await params;
  const variantModule = getModule(type, variant);
  if (!variantModule) notFound();

  return (
    <>
      <NavBar />
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <header>
          <p className="text-sm text-neutral-500">{variantModule.formatType.toUpperCase()}</p>
          <h1 className="text-2xl font-semibold">{variantModule.label}</h1>
          <p className="text-sm text-neutral-500 mt-1">{variantModule.description}</p>
        </header>

        <section>
          <h2 className="text-lg font-medium mb-3">Fields</h2>
          <FieldTable fields={variantModule.fields} />
        </section>

        <section>
          <h2 className="text-lg font-medium mb-3">Business rules</h2>
          <RulesMarkdown content={variantModule.promptGuidance} />
        </section>

        <section>
          <h2 className="text-lg font-medium mb-3">Reference sample</h2>
          <SampleViewer content={variantModule.sample} />
        </section>
      </div>
    </>
  );
}
