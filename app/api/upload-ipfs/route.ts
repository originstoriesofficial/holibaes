import { NextResponse } from 'next/server';
import { uploadToIPFS } from '../../lib/ipfs';

export async function POST(req: Request) {
  try {
    const { base64, fileName, mimeType, animal, cape, hand } = await req.json();

    if (!base64 || !fileName || !mimeType) {
      return NextResponse.json({ error: 'Missing upload parameters' }, { status: 400 });
    }

    const buffer = Buffer.from(base64.split(',')[1], 'base64');
    const file = new File([buffer], fileName, { type: mimeType });

    const attributes = { animal, cape, hand };

    const result = await uploadToIPFS(file, attributes);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Upload API error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
