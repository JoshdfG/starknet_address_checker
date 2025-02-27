import { RpcProvider, hash } from "starknet";

export function isValidStarknetAddress(address: string): boolean {
  console.log("\n---------------------------------------------------------\n");

  console.log(`\nChecking ${address}`);

  if (!/^0x0[0-9a-fA-F]{63}$/.test(address)) {
    console.log("❌ Invalid format - Must be 66 characters starting with 0x0");
    return false;
  }

  try {
    const bigIntVal = BigInt(address);

    if (bigIntVal === BigInt(0)) {
      console.log("❌ Invalid - Zero address (0x000...000)");
      return false;
    }

    const checksum = hash.starknetKeccak(address);
    if (!checksum) {
      console.log("❌ Failed checksum validation");
      return false;
    }

    console.log("✅ Valid Starknet address");
    console.log(
      "\n---------------------------------------------------------\n"
    );

    return true;
  } catch (error) {
    console.log("❌ Invalid hex value - Contains non-hex characters");
    return false;
  }
}

// Add known account implementations
const KNOWN_ACCOUNTS: Record<string, string> = {
  ARGENT: "0x01a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003",
  BRAAVOS: "0x03131fa018d520a037686ce3efddeab8f28895662f019ca3ca18a626650f7d1e",
  OPENZEPPELIN:
    "0x058d97f7d76e78f44905cc30cb65b91ea49a4b908a76703c54197bca90f81773",
};

export interface CheckWalletOptions {
  network?: "mainnet-alpha" | "sepolia-alpha" | "custom";
  nodeUrl?: string;
  provider?: RpcProvider;
  silent?: boolean;
}

export type CheckResult = {
  success: boolean;
  type: "wallet" | "contract" | "eoa" | "unknown" | "invalid";
  message: string;
  classHash?: string;
  network?: string;
  error?: string;
};

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
): Promise<CheckResult> {
  const result: CheckResult = {
    success: false,
    type: "unknown",
    message: "Initializing verification",
  };

  try {
    const nodeUrl =
      options.nodeUrl || DEFAULT_RPCS[options.network || "sepolia-alpha"];
    if (!nodeUrl) {
      throw new Error("Invalid network configuration");
    }

    const provider = options.provider || new RpcProvider({ nodeUrl });
    result.network = nodeUrl;

    // Address format validation
    if (!/^0x0[0-9a-fA-F]{63}$/.test(address)) {
      return {
        success: false,
        type: "invalid",
        message: `Invalid address format: ${address} is not a valid Starknet address`,
      };
    }

    // Class hash retrieval
    const classHash = await retryOperation(() =>
      provider.getClassHashAt(address)
    );
    result.classHash = classHash;

    if (!classHash?.startsWith("0x")) {
      return {
        success: true,
        type: "eoa",
        message: `Address ${address} is likely an Externally Owned Account (EOA)`,
      };
    }

    // Known account detection
    const knownAccount = Object.entries(KNOWN_ACCOUNTS).find(
      ([, hash]) => hash === classHash
    );
    if (knownAccount) {
      return {
        success: true,
        type: "wallet",
        message: `Detected ${knownAccount[0]} smart wallet`,
        classHash,
        network: nodeUrl,
      };
    }

    // ABI analysis
    const contractClass = await retryOperation(() =>
      provider.getClassByHash(classHash)
    );
    const hasEntryPoints = ["__execute__", "__validate__"].every((name) =>
      contractClass.entry_points_by_type?.EXTERNAL?.some(
        (e) => e.selector === hash.getSelectorFromName(name)
      )
    );

    return hasEntryPoints
      ? {
          success: true,
          type: "wallet",
          message: `Detected smart wallet (Class Hash: ${classHash})`,
          classHash,
          network: nodeUrl,
        }
      : {
          success: true,
          type: "contract",
          message: `Detected regular contract (Class Hash: ${classHash})`,
          classHash,
          network: nodeUrl,
        };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      type: "unknown",
      message: `Verification failed for ${address}: ${errorMessage}`,
      error: errorMessage,
    };
  }
}

export async function checkAddress(
  address: string,
  options: CheckWalletOptions = {}
): Promise<CheckResult> {
  try {
    // Initial validation
    if (!/^0x0[0-9a-fA-F]{63}$/.test(address)) {
      return {
        success: false,
        type: "invalid",
        message: `Invalid address: ${address} does not match Starknet format`,
      };
    }

    const result = await isSmartWallet(address, options);

    // Enhance EOA message with additional context
    if (result.type === "eoa") {
      return {
        ...result,
        message: `${address} has no deployed contract (likely EOA or counterfactual address)`,
      };
    }

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      type: "unknown",
      message: `Critical error verifying ${address}: ${errorMessage}`,
      error: errorMessage,
    };
  }
}
// export interface CheckWalletOptions {
//   network?: "mainnet-alpha" | "sepolia-alpha" | "custom";
//   nodeUrl?: string;
//   provider?: RpcProvider;
// }

// const DEFAULT_RPCS: Record<string, string> = {
//   "mainnet-alpha": "https://starknet-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
//   "sepolia-alpha": "https://free-rpc.nethermind.io/sepolia-juno",
// };

// async function retryOperation<T>(
//   operation: () => Promise<T>,
//   retries: number = 3
// ): Promise<T> {
//   for (let i = 0; i < retries; i++) {
//     try {
//       return await operation();
//     } catch (error) {
//       if (i === retries - 1) throw error;
//       await new Promise((res) => setTimeout(res, 1000 * (i + 1)));
//     }
//   }
//   throw new Error("Max retries reached");
// }

// export async function isSmartWallet(
//   address: string,
//   options: CheckWalletOptions = {}
// ): Promise<boolean> {
//   const nodeUrl =
//     options.nodeUrl || DEFAULT_RPCS[options.network || "sepolia-alpha"];

//   if (!nodeUrl) {
//     throw new Error("Invalid network or missing nodeUrl");
//   }

//   const provider = options.provider || new RpcProvider({ nodeUrl });

//   try {
//     const classHash = await retryOperation(() =>
//       provider.getClassHashAt(address)
//     );

//     if (!classHash || !classHash.startsWith("0x")) {
//       console.log("Invalid or missing class hash");
//       return false;
//     }

//     const contractClass = await retryOperation(() =>
//       provider.getClassByHash(classHash)
//     );

//     if (!contractClass?.entry_points_by_type?.EXTERNAL) {
//       console.log("❌ No external entry points, not a wallet");
//       return false;
//     }

//     const externalEntryPoints = contractClass.entry_points_by_type.EXTERNAL.map(
//       (entry) => entry.selector
//     );

//     const requiredSelectors = ["__execute__", "__validate__"].map((name) =>
//       hash.getSelectorFromName(name)
//     );

//     return requiredSelectors.every((selector) =>
//       externalEntryPoints.includes(selector)
//     );
//   } catch (error) {
//     console.error(
//       "Check failed:",
//       error instanceof Error ? error.message : error
//     );
//     return false;
//   }
// }

// export async function isSmartContract(
//   address: string,
//   options: CheckWalletOptions = {}
// ): Promise<boolean> {
//   const nodeUrl =
//     options.nodeUrl || DEFAULT_RPCS[options.network || "sepolia-alpha"];

//   if (!nodeUrl) {
//     throw new Error("Invalid network or missing nodeUrl");
//   }

//   const provider = options.provider || new RpcProvider({ nodeUrl });

//   try {
//     const classHash = await retryOperation(() =>
//       provider.getClassHashAt(address)
//     );

//     if (!classHash || !classHash.startsWith("0x")) {
//       console.log("Invalid or missing class hash");
//       return false;
//     }

//     const contractClass = await retryOperation(() =>
//       provider.getClassByHash(classHash)
//     );

//     if (!contractClass?.entry_points_by_type?.EXTERNAL) {
//       console.log("❌ No external entry points, not a wallet");
//       return false;
//     }

//     const externalEntryPoints = contractClass.entry_points_by_type.EXTERNAL.map(
//       (entry) => entry.selector
//     );

//     const requiredSelectors = ["__execute__", "__validate__"].map((name) =>
//       hash.getSelectorFromName(name)
//     );

//     return requiredSelectors.every(
//       (selector) => !externalEntryPoints.includes(selector)
//     );
//   } catch (error) {
//     console.error(
//       "Check failed:",
//       error instanceof Error ? error.message : error
//     );
//     return false;
//   }
// }

// export async function checkAddress(
//   address: string,
//   options: CheckWalletOptions = {}
// ): Promise<boolean> {
//   const nodeUrl =
//     options.nodeUrl || DEFAULT_RPCS[options.network || "mainnet-alpha"];

//   if (!nodeUrl) {
//     throw new Error("Invalid network or missing nodeUrl");
//   }

//   const provider = new RpcProvider({ nodeUrl });

//   try {
//     console.log(`\n🔍 Checking ${address}`);

//     if (!/^0x0[0-9a-fA-F]{63}$/.test(address)) {
//       console.log("❌ Invalid address format");
//       return false;
//     }

//     const classHash = await provider.getClassHashAt(address);
//     console.log("Class hash:", classHash || "Not found");

//     if (!classHash) {
//       console.log("❌ No contract at this address");
//       return false;
//     }

//     const isWallet = await isSmartWallet(address, { provider });
//     if (!isWallet) {
//       console.log(`🛡️ Is Smart Wallet: ${isWallet ? "✅ Yes" : "❌ No"}`);
//       return true;
//     } else if (await isSmartContract(address, { provider })) {
//       console.log(`🛡️ Is Smart Contract: ${isWallet ? "✅ Yes" : "❌ No"}`);
//     }

//     return isWallet;
//   } catch (error) {
//     console.error(
//       "❌ Check failed:",
//       error instanceof Error ? error.message : error
//     );
//     return false;
//   }
// }

const BRAVOS_ADDRESS =
  "0x0554b4a27e6ba1e00a01deebdf486c9c0e7bffc5074f67dfbb79bbf011162a62";
checkAddress(BRAVOS_ADDRESS);

const validation =
  "0x0785940c89f936c4b2aab5078f18050e1d172227e13441697f1e7dd5ef11266c";
isValidStarknetAddress(validation);
