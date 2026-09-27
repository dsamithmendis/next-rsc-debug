import { DevTools } from "@next-rsc-debug/devtools";

export default function DebugPage() {
  return (
    <div className="p-4">
      <DevTools url="/api/debug-events" />
    </div>
  );
}
