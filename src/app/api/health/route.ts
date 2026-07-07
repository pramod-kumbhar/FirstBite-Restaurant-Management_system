import { client } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    client.prepare("select 1").get();
    return Response.json({ ok: true, database: "connected" });
  } catch (error: any) {
    return Response.json({ ok: false, database: "disconnected", error: error?.message || "Database unavailable" }, { status: 500 });
  }
}
