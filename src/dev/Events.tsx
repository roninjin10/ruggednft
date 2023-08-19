import { useState } from 'react'
import { mainnet, useBlockNumber, useContractEvent, useNetwork } from 'wagmi'
import { RuggedNft } from '../../contracts/RuggedNft.sol'

export const Events = () => {
	const { chain = mainnet } = useNetwork()
	const chainId = chain.id

	const { data: blockNumber } = useBlockNumber()

	// TODO add types to EvmtsContract type
	const [transferEvents, setTransferEvents] = useState<any[]>([])
	const [ruggedEvents, setRuggedEvents] = useState<any[]>([])
	const [payoutEvents, setPayoutEvents] = useState<any[]>([])
	const [approvalEvents, setApprovalEvents] = useState<any[]>([])
	const [approvalForAllEvents, setApprovalForAllEvents] = useState<any[]>([])

	const allEvents = {
		transferEvents,
		ruggedEvents,
		payoutEvents,
		approvalEvents,
		approvalForAllEvents,
	}

	useContractEvent({
		...RuggedNft.events({ chainId }).Transfer({
			fromBlock: blockNumber && blockNumber - BigInt(10_000),
		}),
		listener: (event) => {
			setTransferEvents([...transferEvents, event])
		},
	})
	useContractEvent({
		...RuggedNft.events({ chainId }).Rugged({
			fromBlock: blockNumber && blockNumber - BigInt(10_000),
		}),
		listener: (event) => {
			setRuggedEvents([...transferEvents, event])
		},
	})
	useContractEvent({
		...RuggedNft.events({ chainId }).Payout({
			fromBlock: blockNumber && blockNumber - BigInt(10_000),
		}),
		listener: (event) => {
			setPayoutEvents([...transferEvents, event])
		},
	})
	useContractEvent({
		...RuggedNft.events({ chainId }).Approval({
			fromBlock: blockNumber && blockNumber - BigInt(10_000),
		}),
		listener: (event) => {
			setApprovalEvents([...transferEvents, event])
		},
	})
	useContractEvent({
		...RuggedNft.events({ chainId }).ApprovalForAll({
			fromBlock: blockNumber && blockNumber - BigInt(10_000),
		}),
		listener: (event) => {
			setApprovalForAllEvents([...transferEvents, event])
		},
	})
	return (
		<div>
			<h3>Events</h3>
			{
				Object.entries(allEvents).map(([eventName, events]) => {
					return events.length > 0 && <><div>{eventName} events</div>
						<div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
							{events.map((event, i) => {
								return (
									<div>
										<div>Event {i}</div>
										<div>{JSON.stringify(event)}</div>
									</div>
								)
							})}
						</div></>
				})
			}
		</div>
	)
}
