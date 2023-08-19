import { useState } from 'react'
import { Address, mainnet, useAccount, useContractRead, useNetwork } from 'wagmi'
import { RuggedNft } from '../../contracts/RuggedNft.sol'

export const Reads = () => {
	const { address, isConnected } = useAccount()

	const { chain = mainnet } = useNetwork()
	const chainId = chain.id
	const [isRuggedQuery, setIsRuggedQuery] = useState(0)

	const { data: balance } = useContractRead({
		/**
		 * Spreading in a method will spread abi, address and args
		 * Hover over balanceOf and click go-to-definition should take you to the method definition in solidity if compiling from solidity
		 */
		...RuggedNft.read({ chainId }).balanceOf(address as Address),
		enabled: isConnected,
	})
	const { data: totalSupply } = useContractRead({
		...RuggedNft.read({ chainId }).totalSupply(),
		enabled: isConnected,
	})
	const { data: tokenUri } = useContractRead({
		...RuggedNft.read({ chainId }).tokenURI(BigInt(1)),
		enabled: isConnected,
	})
	const { data: symbol } = useContractRead({
		...RuggedNft.read({ chainId }).symbol(),
		enabled: isConnected,
	})
	const { data: ownerOf } = useContractRead({
		...RuggedNft.read({ chainId }).ownerOf(BigInt(1)),
		enabled: isConnected,
	})
	const { data: isRugged } = useContractRead({
		...RuggedNft.read({ chainId }).rugged(BigInt(isRuggedQuery)),
		enabled: isConnected,
	})
	const { data: jackpot } = useContractRead({
		...RuggedNft.read({ chainId }).jackpot(),
		enabled: isConnected,
	})
	const { data: mintPrice } = useContractRead({
		...RuggedNft.read({ chainId }).MINT_PRICE(),
		enabled: isConnected,
	})
	const { data: amountOfRugs } = useContractRead({
		...RuggedNft.read({ chainId }).ruggedSupply(),
		enabled: isConnected,
	})
	return (
		<div>
			<div>
				<div>
					balanceOf({address}): {balance?.toString()}
				</div>
				<div>totalSupply(): {totalSupply?.toString()}</div>
				<div>tokenUri(BigInt(1)): {tokenUri?.toString()}</div>
				<div>symbol(): {symbol?.toString()}</div>
				<div>ownerOf(BigInt(1)): {ownerOf?.toString()}</div>
				<div>jackpot(): {jackpot?.toString()}</div>
				<div>mintPrice(): {mintPrice?.toString()}</div>
				<div>amountOfRugs(): {amountOfRugs?.toString()}</div>
				<div>isRugged
					<input type="number" onChange={(e) => setIsRuggedQuery(parseInt(e.target.value))} />
					: {isRugged?.toString()}
				</div>
			</div>
		</div>
	)
}
