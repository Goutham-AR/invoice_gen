import { notFound } from "next/navigation";
import FieldTable from "@/components/docs/FieldTable";
import RulesMarkdown from "@/components/docs/RulesMarkdown";
import SampleViewer from "@/components/docs/SampleViewer";
import { registry, getModule } from "@/lib/formats/registry";

const GROUP_LABELS: Record<string, string> = { csv: "CSV", edi: "EDI", quickbooks: "QuickBooks" };

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
    <div className="mx-auto max-w-4xl px-8 py-12 space-y-10">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-wider text-stamp">
          {GROUP_LABELS[variantModule.formatType] ?? variantModule.formatType}
        </p>
        <h1 className="font-display italic text-3xl text-ink mt-1">{variantModule.label}</h1>
        <p className="text-sm text-ink-muted mt-2 max-w-lg">{variantModule.description}</p>
      </header>

      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-3">
          Fields
        </h2>
        <FieldTable fields={variantModule.fields} />
      </section>

      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-3">
          Guide
        </h2>
        <div className="rounded-xl border border-hairline bg-surface p-6">
          <RulesMarkdown content={variantModule.guide} />
        </div>
        <details className="mt-3 group">
          <summary className="cursor-pointer text-xs text-ink-muted hover:text-ink select-none">
            View original source rules
          </summary>
          <div className="rounded-xl border border-hairline bg-surface p-6 mt-2">
            <RulesMarkdown content={variantModule.promptGuidance} />
          </div>
        </details>
      </section>

      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-3">
          Reference sample
        </h2>
        <SampleViewer content={variantModule.sample} />
      </section>
    </div>
  );
}
