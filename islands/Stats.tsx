import { useSignal } from "@preact/signals";
import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const resp = await ctx.render();
    resp.headers.set("Access-Control-Allow-Origin", "https://www.etoro.com");
    return resp;
  },
};

interface StatsResponse {
  Data: {
    Exposure: number
  }
}

export default function Stats() {
  const exposure = useSignal('');

  const refresh = () => {
    const resp = fetch("/api/etoro/stats", { mode: "no-cors" }).then((
      resp,
    ) => resp.json()).then((resp: StatsResponse) =>
      exposure.value = resp.Data.Exposure + '%'
    );
  };

  return (
    <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
      <h2>Investor Stats</h2>
      <p class="my-4">Exposure: {exposure}</p>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
