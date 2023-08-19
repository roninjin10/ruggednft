import { useState } from 'react'
import {
	Address,
	mainnet,
	useAccount,
	useContractRead,
	useContractWrite,
	useNetwork,
	useWaitForTransaction,
} from 'wagmi'
import { RuggedNft } from '../../contracts/RuggedNft.sol'
import { getRandomInt } from '../utils/getRandomInt'

export const Writes = () => {
	const [approveto, setApproveto] = useState('')
	const [rugId, setRugId] = useState('')
	const { address, isConnected } = useAccount()

	const { chain = mainnet } = useNetwork()
	const chainId = chain.id

	const { data, refetch } = useContractRead({
		/**
		 * Spreading in a method will spread abi, address and args
		 * Hover over balanceOf and click go-to-definition should take you to the method definition in solidity if compiling from solidity
		 */
		...RuggedNft.read().balanceOf(address as Address),
		enabled: isConnected,
	})

	const { writeAsync: writeMint, data: mintData } = useContractWrite({
		/**
		 * Not calling the function will return abi and address without args
		 * This is useful for when you want to lazily call the function like in case of useContractWrite
		 */
		...RuggedNft.write({ chainId }).mint,
		onSuccess: console.log
	})

	const { writeAsync: writeApprove } = useContractWrite({
		/**
		 * Not calling the function will return abi and address without args
		 * This is useful for when you want to lazily call the function like in case of useContractWrite
		 */
		...RuggedNft.write({ chainId }).approve,
		onSuccess: console.log
	})

	const { writeAsync: writeTransfer, data: transferData } = useContractWrite({
		/**
		 * Not calling the function will return abi and address without args
		 * This is useful for when you want to lazily call the function like in case of useContractWrite
		 */
		...RuggedNft.write({ chainId }).transferFrom,
		onSuccess: console.log
	})

	const { writeAsync: writeRug} = useContractWrite({
		/**
		 * Not calling the function will return abi and address without args
		 * This is useful for when you want to lazily call the function like in case of useContractWrite
		 */
		...RuggedNft.write({ chainId }).rug,
		onSuccess: console.log
	})
	const { writeAsync: writePayout} = useContractWrite({
		/**
		 * Not calling the function will return abi and address without args
		 * This is useful for when you want to lazily call the function like in case of useContractWrite
		 */
		...RuggedNft.write({ chainId }).payout,
		onSuccess: console.log
	})

	useWaitForTransaction({
		hash: mintData?.hash,
		onSuccess: (receipt) => {
			console.log('minted', receipt)
			refetch()
		},
	})

	return (
		<div>
			<div>
				<div>balance: {data?.toString()}</div>
			</div>
			<button
				type='button'
				onClick={() =>
					writeMint()
				}
			>
				Mint
			</button>
			<input
				type='text'
				value={approveto}
				placeholder='set an address to approve to or transfer to'
				onChange={(e) => setApproveto(e.target.value)}
			/>
			<button
				type='button'
				onClick={() =>
					writeApprove(RuggedNft.write({chainId}).approve(approveto as Address, BigInt(1)))
				}
			>
				Approve
			</button>
			<button
				type='button'
				onClick={() =>
					writeTransfer(RuggedNft.write({chainId}).transferFrom(address as Address, approveto as Address, BigInt(1)))
				}
			>
				Transfer
			</button>
			<div>Rug</div>
			<input
				type='text'
				value={rugId}
				placeholder='set a tokenid to rug or payout'
				onChange={(e) => setRugId(e.target.value)}
			/>
			<button
				type='button'
				onClick={() =>
					writeRug(RuggedNft.write({chainId}).rug(BigInt(rugId)))
				}
			/>
			<div>Payout</div>
			<button
				type='button'
				onClick={() =>
					writePayout(
						RuggedNft.write({chainId}).payout(BigInt(rugId))
					)
				}
			/>
		</div>
	)
}
