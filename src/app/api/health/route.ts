import { client, initPromise } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initPromise;
    if (typeof client.execute === "function") {
      await client.execute("select 1");
    } else {
      client.prepare("select 1").get();
    }
    return Response.json({ ok: true, database: "connected" });
  } catch (error: any) {
    return Response.json({ ok: false, database: "disconnected", error: error?.message || "Database unavailable" }, { status: 500 });
  }
}
