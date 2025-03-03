import { checkAddress, isValidStarknetAddress } from "../src/checker";

describe("Starknet Wallet Checker", () => {
  const DEFAULT_RPCS: Record<string, string> = {
    mainnet:
      "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/OEXJ9TcADB3MesS1_JuEc-UXQ_rBMsPR",
    sepolia: "https://free-rpc.nethermind.io/sepolia-juno",
  };

  let BRAVOS_TEST_RPC = "https://free-rpc.nethermind.io/sepolia-juno";

  const BRAVOS_TEST_ADDRESS =
    "0x06eC96291A904b8B62B446FB32fC9903b5f82D73D7CA319E03ba45D50788Ec30";

  it("should detect smart wallet on Sepolia", async () => {
    const result = await checkAddress(BRAVOS_TEST_ADDRESS, {
      nodeUrl: BRAVOS_TEST_RPC,
    });

    expect(result).toBe(true);
  }, 10000);

  it("should detect smart wallet on Mainnet", async () => {
    const BRAVOS_ADDRESS =
      "0x0554a2a3995bec625cab7963b6809b0387e5273d9f68c389ac6aa255c4c85b45";

    const result = await checkAddress(BRAVOS_ADDRESS, {
      nodeUrl: DEFAULT_RPCS["mainnet"],
    });

    expect(result).toBe(true);
  }, 10000);

  it("should fail if smart wallet is not deployed on Mainnet", async () => {
    const NOT_DEPLOYED_ADDRESS =
      "0x01729ce1AD61551F08A1A5d4A8a0d3753de028b26b229FF021Ad8a9D3c1c29C9";

    const result = await checkAddress(NOT_DEPLOYED_ADDRESS, {
      nodeUrl: DEFAULT_RPCS["mainnet"],
    });

    expect(result).toBe(false);
  }, 10000);

  it("should detect contract address on testnet", async () => {
    const CONTRACT_ADDRESS =
      "0x04e49f15aba463e014216cfa37049d0dd5c4bcb6c5743a60b4854c30a35cce0e";
    const result = await checkAddress(CONTRACT_ADDRESS, {
      nodeUrl: BRAVOS_TEST_RPC,
    });

    expect(result).toBe(true);
  });

  it("should detect contract address on mainnet", async () => {
    const CONTRACT_ADDRESS =
      "0x006a06ca686c6193a3420333405fe6bfb065197d670c645bdc0722a36d88982f";
    const result = await checkAddress(CONTRACT_ADDRESS, {
      nodeUrl: DEFAULT_RPCS["mainnet"],
    });

    expect(result).toBe(true);
  });

  it("should handle invalid addresses", async () => {
    const result = await checkAddress("0xinvalid", {
      nodeUrl: DEFAULT_RPCS["sepolia"],
    });

    expect(result).toBe(false);
  });

  it("should fail with invalid address on testnet", async () => {
    const CONTRACT_ADDRESS =
      "0x05e542bcb265e43f7eeae398bba7114ccb4afc115c76adffb0bba8f0ca59ff65";
    const result = await checkAddress(CONTRACT_ADDRESS, {
      nodeUrl: BRAVOS_TEST_RPC,
    });

    expect(result).toBe(false);
  });
});

describe("Check valid address length", () => {
  it("should return true and return the same address if valid", () => {
    const inputAddress =
      "0x0785940c89f936c4b2aab5078f18050e1d172227e13441697f1e7dd5ef11266c";
    const [isValid, resultAddress] = isValidStarknetAddress(inputAddress);

    expect(isValid).toBe(true);
    expect(resultAddress).toBe(inputAddress);
  });

  it("should modify the address and return true   ", () => {
    let address =
      "0x06a06ca686c6193a3420333405fe6bfb065197d670c645bdc0722a36d88982f";
    const [isValid, resultAddress] = isValidStarknetAddress(address);
    let expected =
      "0x006a06ca686c6193a3420333405fe6bfb065197d670c645bdc0722a36d88982f";
    expect(isValid).toBe(true);
    expect(resultAddress).toBe(expected);
  });

  it("should return address as it is if length is 64 without prefix", () => {
    const inputAddress =
      "0x006a06ca686c6193a3420333405fe6bfb065197d670c645bdc0722a36d88982f";

    const [isValid, resultAddress] = isValidStarknetAddress(inputAddress);

    expect(isValid).toBe(true);
    expect(resultAddress).toBe(inputAddress);
  });
});

describe("should fail with invalid address length", () => {
  it("should return false for invalid address length", () => {
    const inputAddress =
      "0x0785940c89f936c4b2aab5078f18050e1d172227e13441697f1e7dd5ef1126";

    const [isValid, resultAddress] = isValidStarknetAddress(inputAddress);

    expect(isValid).toBe(false);
    expect(resultAddress).toBe(inputAddress);
  });
});
