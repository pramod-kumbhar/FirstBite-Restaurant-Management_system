import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, database: "connected" });
  } catch (error: any) {
    return Response.json({ ok: false, database: "disconnected", error: error?.message || "Database unavailable" }, { status: 500 });
  }
}
