import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    { error: "Internal Server Error", code: 500 },
    { status: 500 }
  );
}