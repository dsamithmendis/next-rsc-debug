import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const delay = Number.parseInt(searchParams.get("delay") ?? "0", 10);

  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  return NextResponse.json({
    message: "Hello from /api/hello",
    timestamp: Date.now(),
    delay,
  });
}
