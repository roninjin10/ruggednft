import { Theme } from '@radix-ui/themes'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

import { useState } from 'react'
import { Events } from './dev/Events'
import { Reads } from './dev/Reads'
import { Writes } from './dev/Writes'

export function App() {
	const [selectedComponent, selectComponent] =
		useState<keyof typeof components>('unselected')

	const { isConnected } = useAccount()

	const components = {
		unselected: <>Select which component to render</>,
		reads: <Reads />,
		writes: <Writes />,
		events: <Events />,
	} as const

	return (
		<Theme>
			<h1>Rugged NFT</h1>
			<ConnectButton />
			{isConnected && import.meta.env.NODE_ENV !== 'production' && (
				<>
					<hr />
					<div style={{ display: 'flex' }}>
						{Object.keys(components).map((component) => {
							return (
								<button
									type='button'
									onClick={() =>
										selectComponent(component as keyof typeof components)
									}
								>
									{component}
								</button>
							)
						})}
					</div>
					<h2>{selectedComponent}</h2>
					{components[selectedComponent]}
				</>
			)}
		</Theme>
	)
}
