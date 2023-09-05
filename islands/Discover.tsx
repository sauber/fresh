import { useSignal } from "@preact/signals";

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
