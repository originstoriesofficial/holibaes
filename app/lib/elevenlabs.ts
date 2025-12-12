export async function generateVoice(prompt: string): Promise<string> {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: prompt,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    })
  
    const blob = await res.blob()
    const buffer = Buffer.from(await blob.arrayBuffer())
    const base64 = buffer.toString('base64')
    return `data:audio/mpeg;base64,${base64}`
  }
  