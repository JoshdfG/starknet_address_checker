import { RpcProvider } from "starknet";
import { isSmartWallet, isKnownAccount, KNOWN_ACCOUNTS } from "./index";

// async function checkAddress(address: string) {
//   try {
//     const isWallet = await isSmartWallet(address);
//     console.log(`\nChecking address: ${address}`);
//     console.log(`Is smart wallet? ${isWallet ? "YES" : "NO"}`);

//     if (isWallet) {
//       const provider = new RpcProvider({
//         nodeUrl: "https://starknet-mainnet.public.blastapi.io",
//       });
//       const classHash = await provider.getClassHashAt(address);

//       if (isKnownAccount(classHash)) {
//         const accountType = Object.entries(KNOWN_ACCOUNTS).find(
//           ([, hash]) => hash === classHash
//         )?.[0];
//         console.log(`Detected wallet type: ${accountType}`);
//       }
//     }
//   } catch (error: any) {
//     console.error(`Error checking address ${address}: ${error.message}`);
//   }
// }

// // Test addresses
// const TEST_ADDRESSES = [
//   //   "0x0554b4a27e6ba1e00a01deebdf486c9c0e7bffc5074f67dfbb79bbf011162a62", // Argent
//   "0x01729ce1AD61551F08A1A5d4A8a0d3753de028b26b229FF021Ad8a9D3c1c29C9",
//   "0x024d1e3556f7c6a7f6a0c6679323e1a157b0e4e9605e3a0f7e59e91e8daf7d3", // OpenZeppelin
//   "0x000000000000000000000000000000000000000000000000000000000000dead", // Invalid
// ];

// (async () => {
//   for (const address of TEST_ADDRESSES) {
//     await checkAddress(address);
//   }
// })();
