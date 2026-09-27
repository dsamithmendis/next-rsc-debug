import { DevTools } from "@next-rsc-debug/devtools";

export default function DebugPage() {
  return (
    <div style={{ padding: 16 }}>
      <DevTools url="/api/debug-events" />
    </div>
  );
}
