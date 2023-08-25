const source = "https://www.etoro.com/sapi/trade-data-real/live/public/portfolios?cid=12509391&client_request_id=ed20a6ca-ecc7-4d3c-903f-4806d2237ec6";

export const handler = async (): Promise<Response> => {
  const resp = await fetch(source);
  return new Response(resp.body);
};
