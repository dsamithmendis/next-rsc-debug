import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const delay = Number.parseInt(searchParams.get("delay") ?? "800", 10);
  await new Promise((resolve) => setTimeout(resolve, delay));

  return NextResponse.json({
    message: "Slow response",
    delay,
    timestamp: Date.now(),
  });
}