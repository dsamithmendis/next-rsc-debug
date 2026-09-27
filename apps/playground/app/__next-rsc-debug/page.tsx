import dynamic from "next/dynamic";

const DevTools = dynamic(
  () => import("@next-rsc-debug/devtools").then((m) => m.DevTools),
  { ssr: false }
);

export default function DebugPage() {
  return (
    <div className="p-4">
      <DevTools url="/api/debug-events" />
    </div>
  );
}