'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

export default function NFTGate({ children }: { children: ReactNode }) {
  const { address } = useAccount()
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('quickAuthToken')
    if (!address || !token) return

    fetch('/api/check-nft', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (!res.ok) throw new Error('NFT check failed')
        const d = await res.json()
        setAllowed(d.ownsNFT)
      })
      .catch(err => {
        console.error(err)
        setError('Failed to verify NFT ownership')
      })
  }, [address])

  if (!address) return <p className="text-center">Connect your wallet first.</p>
  if (error) return <p className="text-center text-red-500">{error}</p>
  if (allowed === null) return <p className="text-center">Checking access…</p>
  if (!allowed) return <p className="text-center">You don’t own the required OriginStory NFT.</p>

  return <>{children}</>
}
