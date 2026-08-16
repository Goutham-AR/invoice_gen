import AppSidebar from "@/components/sidebar/AppSidebar";
import RulesManager from "@/components/RulesManager";

export default function RulesPage() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar activeNav="rules">
        <p className="text-xs text-ink-muted px-2.5">
          Rules apply globally, across every format and variant.
        </p>
      </AppSidebar>
      <main className="flex-1 min-w-0">
        <RulesManager />
      </main>
    </div>
  );
}
