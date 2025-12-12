export async function getFarcasterUser(address: string) {
    if (!address) throw new Error('Missing address')
  
    const res = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
      {
        headers: {
          'x-api-key': process.env.NEYNAR_API_KEY!,
        },
        cache: 'no-store',
      }
    )
  
    if (!res.ok) {
      console.error('❌ Neynar lookup failed', res.status, await res.text())
      throw new Error(`Neynar returned ${res.status}`)
    }
  
    const data = await res.json()
    return data?.[address]?.[0]
  }
  