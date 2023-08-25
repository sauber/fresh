import { useSignal } from "@preact/signals";
import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const resp = await ctx.render();
    resp.headers.set("Access-Control-Allow-Origin", "https://www.etoro.com");
    return resp;
  },
};

interface PortfolioResponse {
  CreditByRealizedEquity: number;
  CreditByUnrealizedEquity: number;
  AggregatedPositions: [];
  AggregatedMirrors: [];
  AggregatedPositionsByInstrumentTypeID: [];
  AggregatedPositionsByStockIndustryID: [];
}

export default function Chart() {
  const mirrors = useSignal(0);

  const refresh = () => {
    const resp = fetch("/api/etoro/portfolio", { mode: "no-cors" }).then((
      resp,
    ) => resp.json()).then((resp: PortfolioResponse) =>
      mirrors.value = resp.AggregatedMirrors.length
    );
  };

  return (
    <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
      <h2>Investor Portfolio</h2>
      <p class="my-4">Count of mirrors: {mirrors}</p>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
