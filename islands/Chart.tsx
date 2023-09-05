import { useSignal } from "@preact/signals";

interface ChartResponse {
  simulation: {
    oneYearAgo: {
      "period": string;
      "chart": [];
    };
  };
}

export default function Chart() {
  const days = useSignal(0);

  const refresh = () => {
    const resp = fetch("/api/etoro/chart", { mode: "no-cors" }).then((
      resp,
    ) => resp.json()).then((resp: ChartResponse) =>
      days.value = resp.simulation.oneYearAgo.chart.length
    );
  };

  return (
    <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
      <h2>Investor Chart</h2>
      <p class="my-4">Days in chart: {days}</p>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
