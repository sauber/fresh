import { HandlerContext } from "$fresh/server.ts";
import { DiscoverData, Repo } from "../../../lib/repo.ts";

export const handler = async (
  _req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
  const repo = new Repo(await Deno.makeTempDir());
  const data: DiscoverData = await repo.discover().load();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
};
