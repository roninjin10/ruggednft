import {
  type PublicClient,
  Chain,
  Transport,
} from 'viem'
import { GetL2HashForDepositTxParamters, GetL2HashForDepositTxReturnType, generateDepositHash } from '../utils/generateDepositHash'

export async function getL2HashForDepositTx<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  { l1TxHash, index }: GetL2HashForDepositTxParamters,
): Promise<GetL2HashForDepositTxReturnType> {
  const receipt = await client.getTransactionReceipt({ hash: l1TxHash })
  return generateDepositHash({ l1TxHash, index, receipt })
}

