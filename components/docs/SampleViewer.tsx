export default function SampleViewer({ content }: { content: string }) {
  return (
    <pre className="w-full overflow-x-auto border rounded-md px-3 py-2 text-xs font-mono whitespace-pre">
      {content}
    </pre>
  );
}
