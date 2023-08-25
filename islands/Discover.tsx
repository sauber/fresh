import { useSignal } from "@preact/signals";
import { Button } from "../components/Button.tsx";
import { Handlers } from "$fresh/server.ts";
import { resolve } from "$std/path/win32.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const resp = await ctx.render();
    resp.headers.set("Access-Control-Allow-Origin", "https://www.etoro.com");
    return resp;
  },
};

interface DiscoverResponse {
  Status: string;
  TotalRows: number;
  Items: [];
}

export default function Discover() {
  const count = useSignal(0);

  const refresh = () => {
    const resp = fetch("/api/etoro/discover", { mode: "no-cors" }).then((
      resp,
    ) => resp.json()).then((resp: DiscoverResponse) =>
      count.value = resp.TotalRows
    );
  };

  return (
    <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
      <h2>Load list of investors</h2>
      <p class="my-4">Count of investors: {count}</p>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
