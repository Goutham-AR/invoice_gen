import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function RulesMarkdown({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none prose-table:text-xs">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
