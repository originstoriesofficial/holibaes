export async function generateImage(prompt: string): Promise<string> {
    const res = await fetch('https://api.fal.ai/v1/generate', {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'stabilityai/stable-diffusion-2',
        prompt,
      }),
    })
  
    const data = await res.json()
    return data.image_url || data.output?.[0]?.url || ''
  }
  