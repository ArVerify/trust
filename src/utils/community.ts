import Arweave from "arweave";
import { getContract } from "cacheweave";
import { COMMUNITY } from "arverify";

const client = new Arweave({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

const weightedRandom = (dict: Record<string, number>): string | undefined => {
  let sum = 0;
  const r = Math.random();

  for (const addr of Object.keys(dict)) {
    sum += dict[addr];
    if (r <= sum && dict[addr] > 0) {
      return addr;
    }
  }

  return;
};

export const selectTokenHolder = async (): Promise<string> => {
  const state = await getContract(client, COMMUNITY);
  // @ts-ignore
  const balances = state.balances;
  // @ts-ignore
  const vault = state.vault;

  let total = 0;
  for (const addr of Object.keys(balances)) {
    total += balances[addr];
  }

  for (const addr of Object.keys(vault)) {
    if (!vault[addr].length) continue;

    const vaultBalance = vault[addr]
      .map((a: { balance: number; start: number; end: number }) => a.balance)
      .reduce((a: number, b: number) => a + b, 0);

    total += vaultBalance;

    if (addr in balances) {
      balances[addr] += vaultBalance;
    } else {
      balances[addr] = vaultBalance;
    }
  }

  const weighted: { [addr: string]: number } = {};
  for (const addr of Object.keys(balances)) {
    weighted[addr] = balances[addr] / total;
  }

  return weightedRandom(weighted)!;
};
