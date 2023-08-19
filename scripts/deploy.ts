#!/usr/bin/env node
import { promises as fs } from 'fs'
import { join } from 'path'
import {
	http,
	Address,
	PrivateKeyAccount,
	createPublicClient,
	createWalletClient,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { foundry, optimism, optimismGoerli } from 'viem/chains'
import { z } from 'zod'
import { RuggedNft } from '../contracts/RuggedNft.sol'

// This script will deploy a contract and then write the contract address to the evmts config in tsconfig.json
// TODO consider moving this functionality to a package like @evmts/cli

const ANVIL_PRIVATE_KEY_0 =
	'0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

console.log(`Deploy options:
  DEPLOY_PRIVATE_KEY: ${process.env.DEPLOY_PRIVATE_KEY}
  CHAIN_ID: ${process.env.CHAIN_ID}
  RPC_URL: ${process.env.RPC_URL}
`)

// only deploy to OP chains
const supportedChains = [optimism, optimismGoerli, foundry] as const

// parse private key from env
const account: PrivateKeyAccount = z
	.string()
	.transform((key) => privateKeyToAccount(key as Address))
	.default(ANVIL_PRIVATE_KEY_0)
	.parse(process.env.DEPLOY_PRIVATE_KEY)

const chain = z
	.string()
	.refine(
		(chainId) =>
			supportedChains.some(
				(supportedChain) => supportedChain.id === Number(chainId),
			),
		{
			message: 'Invalid env.CHAIN_ID provided',
		},
	)
	.default(foundry.id.toString())
	.transform((chainId) =>
		supportedChains.find(
			(supportedChain) => supportedChain.id === Number(chainId),
		),
	)
	.parse(process.env.CHAIN_ID)

if (!chain) {
	throw new Error('Unexpected error')
}

const rpcUrl = z.string().url().optional().parse(process.env.RPC_URL)

const client = createWalletClient({
	account,
	chain,
	transport: http(rpcUrl),
})

console.log(
	'deploying contract',
	RuggedNft.name,
	'to chain',
	chain.name,
	'with account',
	account.address,
	'to rpc',
	rpcUrl ?? chain.rpcUrls.default.http[0],
)

const hash = await client.deployContract({
	...RuggedNft,
	account: account.address,
})

console.log('Deploy completed', hash)

const publicClient = createPublicClient({
	chain,
	transport: http(rpcUrl),
})

publicClient.waitForTransactionReceipt({ hash }).then(async (receipt) => {
	console.log('Transaction receipt', receipt)
	if (receipt.status === 'reverted') {
		console.error('Transaction failed')
		process.exit(1)
	}
	console.log('Transaction succeeded')
	console.log('new contract address', receipt.contractAddress)
	console.log('writing contract address to evmts config...')

	// assuming this is ran from root of project
	const tsconfigPath = join('.', 'tsconfig.json')

	fs.readFile(tsconfigPath, 'utf8').then((data) => {
		const config = JSON.parse(data)
		const evmtsConfig = config.compilerOptions.plugins.find(
			(plugin: any) => plugin.name === '@evmts/ts-plugin',
		)
		let contractConfig = evmtsConfig.localContracts.contracts.find(
			(contract: any) => contract.name === 'RuggedNft',
		)
		if (!contractConfig) {
			contractConfig = {}
			evmtsConfig.localContracts.contracts.push(contractConfig)
		}
		contractConfig.name = 'RuggedNft'
		contractConfig.addresses = contractConfig.addresses ?? {}
		contractConfig.addresses[chain.id] = receipt.contractAddress
		fs.writeFile(tsconfigPath, JSON.stringify(config, null, 2), 'utf8')
			.then(() => {
				console.log('Successfully updated tsconfig.json with new address')
			})
			.catch((err) => {
				console.error(err)
				console.error(
					'Contract deployment was successful but tsconfig.json was unable to be updated',
				)
				process.exit(1)
			})
	})
})
