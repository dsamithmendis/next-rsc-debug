import { DevTools } from "@next-rsc-debug/devtools";

export default function DebugPage() {
  return <DevTools url="/api/debug-events" />;
}
