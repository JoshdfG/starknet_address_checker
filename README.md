# Starknet Wallet Checker

A TypeScript library to detect Starknet smart wallet contracts and validate Starknet addresses.

# Features

Check if an address is a smart wallet or smart contract.

Validate Starknet addresses (including fixing addresses with incorrect length).

Easy-to-use API with clear return types.

## Installation

```bash
npm install starknet-wallet-checker
```

# Usage

1. Check if an Address is a Smart Wallet or Smart Contract
   Use the checkAddress function to determine if a given address is a smart wallet, smart contract, or invalid.

Example:

```typescript
import { checkAddress } from "starknet-wallet-checker";

const address = "0x123..."; // Replace with a Starknet address
const result = await checkAddress(address);

console.log(result);
```

Output
The checkAddress function returns an object of type CheckResult with the following properties:

```typescript
{
  isValidAddress: boolean; // Whether the address is valid
  isSmartWallet: boolean; // Whether the address is a smart wallet
  isSmartContract: boolean; // Whether the address is a smart contract
  message: string; // A human-readable message describing the result
}
```

Example Output:

```json
{
  "isValidAddress": true,
  "isSmartWallet": false,
  "isSmartContract": false,
  "message": "🛡️ Is Smart Wallet: ✅ Yes\nYou are interacting with a smart-wallet"
}
```

2. Validate a Starknet Address
   Use the `isValidStarknetAddress` function to validate a Starknet address and fix addresses with incorrect length.

Example:

```typescript
import { isValidStarknetAddress } from "starknet-wallet-checker";

const address = "0x123..."; // Replace with a Starknet address
const [isValid, fixedAddress] = isValidStarknetAddress(address);

console.log(`Is valid: ${isValid}`); // true or false
console.log(`Fixed address: ${fixedAddress}`); // Returns the fixed address if applicable
```

Output
The isValidStarknetAddress function returns a tuple:

[boolean]: Whether the address is valid.

[string]: The fixed address (if applicable) or the original address.

Example output:

```bash
Is valid: true
Fixed address: 0x0123...
```

# API Reference

`checkAddress(address: string, options?: CheckWalletOptions): Promise<CheckResult>`

Checks if a given Starknet address is a smart wallet, smart contract, or invalid.

### Parameters

- `address`: The Starknet address to check.

- `options`: Configuration options.

  ∘ nodeUrl: Custom RPC node URL.

### Returns

## A Promise resolving to a CheckResult object.

`isValidStarknetAddress(address: string): [boolean, string]`
Validates a Starknet address and fixes addresses with incorrect length.

### Parameters

- `address`: The Starknet address to validate.

Returns

A tuple:

- `[boolean]`: Whether the address is valid.

- `[string]`: The fixed address (if applicable) or the original address.

## License

This project is licensed under the [MIT](https://choosealicense.com/licenses/mit/) License. See the LICENSE file for details.
