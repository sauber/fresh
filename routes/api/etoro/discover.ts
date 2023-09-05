import { HandlerContext } from "$fresh/server.ts";
import { DiscoverData, Repo } from "../../../lib/repo.ts";

/*
const source = "https://www.etoro.com/sapi/rankings/rankings?blocked=false&bonusonly=false&copyblock=false&istestaccount=false&optin=true&page=1&period=OneYearAgo&verified=true&isfund=false&copiersmin=1&dailyddmin=-4&gainmin=11&gainmax=350&maxmonthlyriskscoremax=5&maxmonthlyriskscoremin=2&pagesize=70&profitablemonthspctmin=60&sort=-weeklydd&weeklyddmin=-9&activeweeksmin=12&lastactivitymax=14";
export const handler = async (_req: Request, _ctx: HandlerContext): Promise<Response> => {
  const resp = await fetch(source);
  return new Response(resp.body);
};
*/

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
