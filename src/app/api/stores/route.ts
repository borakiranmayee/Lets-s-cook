import { NextResponse } from "next/server";
import { stores } from "@/lib/catalog";

export function GET() {
  return NextResponse.json(stores.map(({ id, name, type }) => ({ id, name, type })));
}
