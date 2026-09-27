import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ items: [1, 2, 3], timestamp: Date.now() });
}