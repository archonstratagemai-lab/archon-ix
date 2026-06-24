import { http, createAccount, getChain, getChainId, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { type SmartAccount } from 'viem/accounts/types';
import { type Client, type Transport, type Chain } from 'viem';
import { createBundlerClient } from 'viem/account-abstraction';
import { useConfig } from 'wagmi';
import { injectedConnector } from 'wagmi/connectors';
import { http } from 'viem';

/**
 * ERC-4337 Smart Account utilities for ARCHON-IX Membership verification.
 *
 * This module provides utilities for working with ERC-4337 smart accounts
 * on Base Sepolia and Mainnet, including:
 * - Bundler client creation
 * - Smart account utilities
 * - Integration with viem / wagmi for user operations
 */

// Base Sepolia chain configuration
export const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  }
} as const;

// Base Mainnet chain configuration
export const base = {
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  }
} as const;

/**
 * Create a bundler client for sending user operations to the ERC-4337 bundler.
 *
 * @param bundlerUrl - The bundler RPC URL (e.g., http://localhost:3000/)
 * @param chain - The target chain (Base Sepolia or Base Mainnet)
 * @returns A bundler client instance
 */
export function createBundlerClient({ bundlerUrl, chain }: {
  bundlerUrl: string;
  chain: Chain;
}) {
  return createBundlerClient({
    transport: http(bundlerUrl),
    chain,
  });
}

/**
 * Create a smart account from a private key.
 *
 * @param privateKey - The private key to use (hex string)
 * @param chain - The target chain (Base Sepolia or Base Mainnet)
 * @returns A smart account instance
 */
export async function createSmartAccount({ privateKey, chain }: {
  privateKey: `0x${string}`;
  chain: Chain;
}): Promise<SmartAccount> {
  const account = privateKeyToAccount(privateKey);
  return createAccount({
    transport: http(),
    chain,
    account: account,
  });
}

/**
 * Validate a smart account address.
 *
 * @param address - The address to validate
 * @param chainId - The chain ID to validate against
 * @returns A boolean indicating whether the address is a valid smart account
 */
export function isValidSmartAccountAddress(address: Address, chainId: number): boolean {
  // For now, just check if it's a valid address format
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Estimate gas for a user operation.
 *
 * @param bundlerClient - The bundler client to use
 * @param userOp - The user operation parameters
 * @returns Estimated gas
 */
export async function estimateUserOpGas({
  bundlerClient,
  userOp,
}: {
  bundlerClient: ReturnType<typeof createBundlerClient>;
  userOp: any;
}): Promise<{preVerificationGas: bigint; verificationGasLimit: bigint; callGasLimit: bigint}> {
  try {
    const result = await bundlerClient.estimateUserOperationGas({
      userOp,
    });
    return result;
  } catch (error) {
    console.error('Error estimating gas for user operation:', error);
    throw error;
  }
}

/**
 * Send a user operation to the bundler.
 *
 * @param bundlerClient - The bundler client to use
 * @param userOp - The user operation parameters
 * @returns The user operation hash
 */
export async function sendUserOp({
  bundlerClient,
  userOp,
}: {
  bundlerClient: ReturnType<typeof createBundlerClient>;
  userOp: any;
}): Promise<`0x${string}`> {
  try {
    const result = await bundlerClient.sendUserOperation({
      userOp,
    });
    return result;
  } catch (error) {
    console.error('Error sending user operation:', error);
    throw error;
  }
}

/**
 * Wait for a user operation to be mined.
 *
 * @param bundlerClient - The bundler client to use
 * @param userOpHash - The user operation hash
 * @returns The transaction receipt
 */
export async function waitForUserOp({
  bundlerClient,
  userOpHash,
}: {
  bundlerClient: ReturnType<typeof createBundlerClient>;
  userOpHash: `0x${string}`;
}): Promise<any> {
  try {
    const result = await bundlerClient.waitForUserOperationReceipt({
      hash: userOpHash,
    });
    return result;
  } catch (error) {
    console.error('Error waiting for user operation:', error);
    throw error;
  }
}

/**
 * Get the current chain ID.
 *
 * @returns The current chain ID
 */
export async function getChainId() {
  const chain = getChain();
  return chain.id;
}

/**
 * Get the current chain configuration.
 *
 * @returns The current chain configuration
 */
export async function getCurrentChain() {
  return getChain();
}

/**
 * Check if a wallet is an EIP-4337 smart account.
 *
 * @param address - The address to check
 * @returns A boolean indicating whether the address is an EIP-4337 smart account
 */
export function isEip4337SmartAccount(address: Address): boolean {
  // Implementation will depend on the specific ERC-4337 implementation
  // For now, just check if it's a valid address format
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Get the owner of a smart account.
 *
 * @param smartAccountAddress - The smart account address
 * @returns The owner address
 */
export async function getSmartAccountOwner(smartAccountAddress: Address): Promise<Address> {
  // This would require calling the specific smart account contract
  // For now, we'll need to implement this based on the specific contract
  throw new Error('getSmartAccountOwner not implemented');
}

/**
 * Validate a user operation.
 *
 * @param userOp - The user operation to validate
 * @returns A boolean indicating whether the user operation is valid
 */
export function validateUserOp(userOp: any): boolean {
  // Basic validation for user operation
  return (
    userOp &&
    userOp.sender &&
    userOp.nonce &&
    userOp.initCode &&
    userOp.callData &&
    userOp.paymaster &&
    userOp.paymasterData &&
    userOp.gasLimit &&
    userOp.maxFeePerGas &&
    userOp.maxPriorityFeePerGas
  );
}