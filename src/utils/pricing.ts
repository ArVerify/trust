export const arToUsd = async (amount: number) => {
  const raw = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=usd"
  );
  const res = await raw.clone().json();

  return parseFloat((amount * res.arweave.usd).toFixed(4));
};
