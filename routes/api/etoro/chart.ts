const source = "https://www.etoro.com/sapi/userstats/CopySim/Username/sauber/OneYearAgo?client_request_id=ed20a6ca-ecc7-4d3c-903f-4806d2237ec6";

export const handler = async (): Promise<Response> => {
  const resp = await fetch(source);
  return new Response(resp.body);
};
