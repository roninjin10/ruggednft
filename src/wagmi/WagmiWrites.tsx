import { RuggedNft } from '../../contracts/RuggedNft.sol'
import { getRandomInt } from '../utils/getRandomInt'
import {
	Address,
	mainnet,
	useAccount,
	useContractRead,
	useContractWrite,
	useNetwork,
	useWaitForTransaction,
} from 'wagmi'

export const WagmiWrites = () => {
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
					writeMint(RuggedNft.write({ chainId }).mint(BigInt(getRandomInt())))
				}
			>
				Mint
			</button>
		</div>
	)
}
