'use client';

import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from '@coinbase/onchainkit/transaction';
import { baseSepolia } from 'viem/chains';
import { MintContractABI } from '../lib/abi/mintContract';
import { CONTRACTS } from '../lib/contracts';
import { useState } from 'react';

export function MintTransaction({ ipfsUrl }: { ipfsUrl: string }) {
  const [status, setStatus] = useState('');

  return (
    <div className="bg-zinc-900 border border-green-700 p-6 rounded-xl mt-6 text-center">
      <Transaction
        chainId={baseSepolia.id}
        isSponsored={true}
        calls={[
          {
            address: CONTRACTS.mintContract as `0x${string}`,
            abi: MintContractABI,
            functionName: 'mint',
            args: [ipfsUrl, BigInt(1)],
            value: BigInt(0),
          },
        ]}
        capabilities={{
          paymasterService: {
            url: process.env.NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT!,
          },
        }}
        onStatus={(s) => setStatus(s.statusName)}
      >
        <TransactionButton
          text="🪙 Mint Monk"
          className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
        />
        <TransactionStatus className="mt-3">
          <TransactionStatusLabel className="text-gray-400" />
          <TransactionStatusAction />
        </TransactionStatus>
      </Transaction>

      {status && <p className="text-sm mt-2 text-gray-400">Status: {status}</p>}
    </div>
  );
}
