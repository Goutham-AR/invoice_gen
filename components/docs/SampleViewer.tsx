export default function SampleViewer({ content }: { content: string }) {
  return (
    <pre className="w-full overflow-x-auto rounded-xl border border-hairline bg-surface px-5 py-4 text-xs font-mono leading-relaxed whitespace-pre text-ink">
      {content}
    </pre>
  );
}
