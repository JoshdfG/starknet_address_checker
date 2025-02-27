import { checkAddress } from "../src";
import type { CheckResult } from "../src";

describe("Starknet Address Verification", () => {
  const MAINNET_RPC =
    "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/OEXJ9TcADB3MesS1_JuEc-UXQ_rBMsPR";
  const SEPOLIA_RPC = "https://free-rpc.nethermind.io/sepolia-juno";

  // Known addresses
  const BRAVOS_TEST_ADDRESS =
    "0x06eC96291A904b8B62B446FB32fC9903b5f82D73D7CA319E03ba45D50788Ec30";

  const BRAVOS_ADDRESS =
    "0x0554a2a3995bec625cab7963b6809b0387e5273d9f68c389ac6aa255c4c85b45";

  const NOT_DEPLOYED_ADDRESS =
    "0x01729ce1AD61551F08A1A5d4A8a0d3753de028b26b229FF021Ad8a9D3c1c29C9";
  const CONTRACT_ADDRESS =
    "0x006a06ca686c6193a3420333405fe6bfb065197d670c645bdc0722a36d88982f";

  // it("should detect known smart wallet implementations", async () => {
  //   const tests = [
  //     { address: BRAVOS_TEST_ADDRESS, name: "Argent" },
  //     { address: BRAVOS_TEST_ADDRESS, name: "Braavos" },
  //   ];

  //   for (const test of tests) {
  //     const result = await checkAddress(test.address, {
  //       nodeUrl: MAINNET_RPC,
  //     });
  //     expect(result.success).toBe(true);
  //     expect(result.type).toBe("wallet");
  //     expect(result.message).toContain(`Detected ${test.name} smart wallet`);
  //     expect(result.classHash).toMatch(/^0x/);
  //   }
  // }, 30000);

  it("should identify  smart wallets", async () => {
    const result = await checkAddress(BRAVOS_ADDRESS, {
      nodeUrl: MAINNET_RPC,
    });

    expect(result.success).toBe(true);
    expect(result.type).toBe("wallet");
    expect(result.message).toContain(
      `Detected smart wallet (Class Hash: ${result.classHash})`
    );
    expect(result.classHash).toBeDefined();
  }, 20000);

  it("should detect regular contracts", async () => {
    const result = await checkAddress(CONTRACT_ADDRESS, {
      nodeUrl: MAINNET_RPC,
    });

    expect(result.success).toBe(true);
    expect(result.type).toBe("contract");
    expect(result.message).toContain("regular contract");
    expect(result.classHash).toBeDefined();
  }, 20000);

  it("should handle undeployed Accounts", async () => {
    const result = await checkAddress(NOT_DEPLOYED_ADDRESS, {
      nodeUrl: MAINNET_RPC,
    });

    expect(result.success).toBe(false);
    expect(result.type).toBe("unknown");
    // expect(result.message).toContain(
    //   (`Verification failed for `${address}: ${errorMessage})`
    // )
    expect(result.message).toContain(
      `Verification failed for ${NOT_DEPLOYED_ADDRESS}`
    );
    expect(result.classHash).toBeUndefined();
  }, 20000);

  it("should reject invalid address formats", async () => {
    const invalidAddresses = [
      "0xinvalid",
      "0x123",
      "0x0785940c89f936c4b2aab5078f18050e1d172227e13441697f1e7dd5ef1126",
    ];

    for (const address of invalidAddresses) {
      const result = await checkAddress(address);
      expect(result.success).toBe(false);
      expect(result.type).toBe("invalid");
      expect(result.message).toContain("does not match Starknet format");
    }
  });

  it("should handle RPC failures gracefully", async () => {
    const result = await checkAddress(BRAVOS_TEST_ADDRESS, {
      nodeUrl: "https://invalid-rpc.example.com",
    });

    expect(result.success).toBe(false);
    expect(result.type).toBe("unknown");
    expect(result.message).toContain("Verification failed");
    expect(result.error).toBeDefined();
  }, 20000);

  it("should detect testnet deployments", async () => {
    const testnetAddress =
      "0x06eC96291A904b8B62B446FB32fC9903b5f82D73D7CA319E03ba45D50788Ec30";

    const result = await checkAddress(testnetAddress, {
      nodeUrl: SEPOLIA_RPC,
    });

    expect(result.success).toBe(true);
    expect(result.type).toBe("wallet");
    expect(result.network).toBe(SEPOLIA_RPC);
  }, 20000);
});

describe("Error Messaging", () => {
  it("should include address in error messages", async () => {
    const invalidAddress = "0xinvalid";
    const result = await checkAddress(invalidAddress);

    expect(result.message).toContain(invalidAddress);
    expect(result.message).toContain("does not match Starknet format");
  });

  it("should preserve RPC errors", async () => {
    const result = await checkAddress("0x123...", {
      nodeUrl: "https://bad-rpc.example.com",
    });

    expect(result.error);
    expect(result.network).rejects;
    expect(result.message).toContain(
      `Invalid address: ${"0x123..."} does not match Starknet format`
    );
  });
});
// describe("Starknet Wallet Checker", () => {
//   const DEFAULT_RPCS: Record<string, string> = {
//     mainnet:
//       "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/OEXJ9TcADB3MesS1_JuEc-UXQ_rBMsPR",
//     sepolia: "https://free-rpc.nethermind.io/sepolia-juno",
//   };

//   let BRAVOS_TEST_RPC = "https://free-rpc.nethermind.io/sepolia-juno";

//   const BRAVOS_TEST_ADDRESS =
//     "0x06eC96291A904b8B62B446FB32fC9903b5f82D73D7CA319E03ba45D50788Ec30";

//   it("should detect smart wallet on Sepolia", async () => {
//     const result = await checkAddress(BRAVOS_TEST_ADDRESS, {
//       nodeUrl: BRAVOS_TEST_RPC,
//     });

//     expect(result).toBe(true);
//   }, 10000);

//   it("should detect smart wallet on Mainnet", async () => {
//     const BRAVOS_ADDRESS =
//       "0x0554a2a3995bec625cab7963b6809b0387e5273d9f68c389ac6aa255c4c85b45";

//     const result = await checkAddress(BRAVOS_ADDRESS, {
//       nodeUrl: DEFAULT_RPCS["mainnet"],
//     });

//     expect(result).toBe(true);
//   }, 10000);

//   it("should fail if smart wallet is not deployed on Mainnet", async () => {
// const NOT_DEPLOYED_ADDRESS =
//   "0x01729ce1AD61551F08A1A5d4A8a0d3753de028b26b229FF021Ad8a9D3c1c29C9";

//     const result = await checkAddress(NOT_DEPLOYED_ADDRESS, {
//       nodeUrl: DEFAULT_RPCS["mainnet"],
//     });

//     expect(result).toBe(false);
//   }, 10000);

//   it("should detect contract address on testnet", async () => {
//     const CONTRACT_ADDRESS =
//       "0x04e49f15aba463e014216cfa37049d0dd5c4bcb6c5743a60b4854c30a35cce0e";
//     const result = await checkAddress(CONTRACT_ADDRESS, {
//       nodeUrl: BRAVOS_TEST_RPC,
//     });

//     expect(result).toBe(true);
//   });

//   it("should detect contract address on mainnet", async () => {
// const CONTRACT_ADDRESS =
//   "0x006a06ca686c6193a3420333405fe6bfb065197d670c645bdc0722a36d88982f";
//     const result = await checkAddress(CONTRACT_ADDRESS, {
//       nodeUrl: DEFAULT_RPCS["mainnet"],
//     });

//     expect(result).toBe(true);
//   });

//   it("should handle invalid addresses", async () => {
//     const result = await checkAddress("0xinvalid", {
//       nodeUrl: DEFAULT_RPCS["sepolia"],
//     });

//     expect(result).toBe(false);
//   });
// });

// describe("Check valid address length", () => {
//   it("should return true for valid address length", () => {
//     const result = isValidStarknetAddress(
//       "0x0785940c89f936c4b2aab5078f18050e1d172227e13441697f1e7dd5ef11266c"
//     );

//     expect(result).toBe(true);
//   });
// });

// describe("should fail with invalid address length", () => {
//   it("should return false for invalid address length", () => {
//     const result = isValidStarknetAddress(
//       "0x0785940c89f936c4b2aab5078f18050e1d172227e13441697f1e7dd5ef11266"
//     );

//     expect(result).toBe(false);
//   });
// });
