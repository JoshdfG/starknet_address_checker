import { RpcProvider, hash } from "starknet";

export interface CheckWalletOptions {
  network?: "mainnet-alpha" | "sepolia-alpha" | "custom";
  nodeUrl?: string;
  provider?: RpcProvider;
}

const DEFAULT_RPCS: Record<string, string> = {
  "mainnet-alpha": "https://starknet-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
  "sepolia-alpha": "https://free-rpc.nethermind.io/sepolia-juno",
};

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((res) => setTimeout(res, 1000 * (i + 1)));
    }
  }
  throw new Error("Max retries reached");
}

export async function isSmartWallet(
  address: string,
  options: CheckWalletOptions = {}
): Promise<boolean> {
  const nodeUrl =
    options.nodeUrl || DEFAULT_RPCS[options.network || "sepolia-alpha"];

  if (!nodeUrl) {
    throw new Error("Invalid network or missing nodeUrl");
  }

  const provider = options.provider || new RpcProvider({ nodeUrl });

  try {
    const classHash = await retryOperation(() =>
      provider.getClassHashAt(address)
    );

    if (!classHash || !classHash.startsWith("0x")) {
      console.log("Invalid or missing class hash");
      return false;
    }

    const contractClass = await retryOperation(() =>
      provider.getClassByHash(classHash)
    );

    if (!contractClass?.entry_points_by_type?.EXTERNAL) {
      console.log("❌ No external entry points, not a wallet");
      return false;
    }

    const externalEntryPoints = contractClass.entry_points_by_type.EXTERNAL.map(
      (entry) => entry.selector
    );

    const requiredSelectors = ["__execute__", "__validate__"].map((name) =>
      hash.getSelectorFromName(name)
    );

    return requiredSelectors.every((selector) =>
      externalEntryPoints.includes(selector)
    );
  } catch (error) {
    console.error(
      "Check failed:",
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

export async function isSmartContract(
  address: string,
  options: CheckWalletOptions = {}
): Promise<boolean> {
  const nodeUrl =
    options.nodeUrl || DEFAULT_RPCS[options.network || "sepolia-alpha"];

  if (!nodeUrl) {
    throw new Error("Invalid network or missing nodeUrl");
  }

  const provider = options.provider || new RpcProvider({ nodeUrl });

  try {
    const classHash = await retryOperation(() =>
      provider.getClassHashAt(address)
    );

    if (!classHash || !classHash.startsWith("0x")) {
      console.log("Invalid or missing class hash");
      return false;
    }

    const contractClass = await retryOperation(() =>
      provider.getClassByHash(classHash)
    );

    if (!contractClass?.entry_points_by_type?.EXTERNAL) {
      console.log("❌ No external entry points, not a wallet");
      return false;
    }

    const externalEntryPoints = contractClass.entry_points_by_type.EXTERNAL.map(
      (entry) => entry.selector
    );

    const requiredSelectors = ["__execute__", "__validate__"].map((name) =>
      hash.getSelectorFromName(name)
    );

    return requiredSelectors.every(
      (selector) => !externalEntryPoints.includes(selector)
    );
  } catch (error) {
    console.error(
      "Check failed:",
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

export async function checkAddress(
  address: string,
  options: CheckWalletOptions = {}
): Promise<boolean> {
  const nodeUrl =
    options.nodeUrl || DEFAULT_RPCS[options.network || "mainnet-alpha"];

  if (!nodeUrl) {
    throw new Error("Invalid network or missing nodeUrl");
  }

  const provider = new RpcProvider({ nodeUrl });

  try {
    console.log(`\n🔍 Checking ${address}`);

    if (!/^0x0[0-9a-fA-F]{63}$/.test(address)) {
      console.log("❌ Invalid address format");
      return false;
    }

    const classHash = await provider.getClassHashAt(address);
    console.log("Class hash:", classHash || "Not found");

    if (!classHash) {
      console.log("❌ No contract at this address");
      return false;
    }

    const isWallet = await isSmartWallet(address, { provider });

    if (isWallet) {
      console.log(`🛡️ Is Smart Wallet: ✅ Yes`);

      console.log(isWallet && "You are interacting with a smart-wallet");
    } else {
      console.log(`🛡️ Is Smart Wallet: ❌ No`);
      const isContract = await isSmartContract(address, { provider });
      console.log(`🛡️ Is Smart Contract: ${isContract ? "✅ Yes" : "❌ No"}`);
      isContract && console.log("You are interacting with a smart-contract");
    }

    return true;
  } catch (error) {
    console.error(
      "❌ Check failed:",
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

export function isValidStarknetAddress(address: string): [boolean, string] {
  const re = /^0x[0-9a-fA-F]{64}$/;

  if (re.test(address)) {
    return [true, address];
  }

  if (address.length === 65 && address.startsWith("0x")) {
    const withoutPrefix = address.slice(2);

    if (/^[0-9a-fA-F]+$/.test(withoutPrefix)) {
      const fixedAddress = `0x0${withoutPrefix}`;
      if (re.test(fixedAddress)) {
        return [true, fixedAddress];
      }
    }
  }

  return [false, address];
}
