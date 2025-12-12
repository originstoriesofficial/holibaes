import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY!,
});

type MetadataAttributes = {
  name?: string;
  animal: string;
  cape: string;
  hand: string;
};

export async function uploadToIPFS(file: File, attributes?: MetadataAttributes) {
  try {
    const imageUpload = await pinata.upload.public.file(file);
    const imageUrl = `https://${process.env.PINATA_GATEWAY!}/ipfs/${imageUpload.cid}`;

    if (attributes) {
      const metadata = {
        name: attributes.name || 'Originstory Token',
        description: 'Minted with Originstory App',
        image: imageUrl,
        attributes: [
          { trait_type: 'Animal', value: attributes.animal },
          { trait_type: 'Cape', value: attributes.cape },
          { trait_type: 'Hand', value: attributes.hand },
        ],
      };

      const metadataFile = new File(
        [JSON.stringify(metadata)],
        'metadata.json',
        { type: 'application/json' }
      );

      const metadataUpload = await pinata.upload.public.file(metadataFile);

      return {
        cid: metadataUpload.cid,
        tokenURI: `https://${process.env.PINATA_GATEWAY!}/ipfs/${metadataUpload.cid}`,
        metadata,
      };
    }

    return {
      cid: imageUpload.cid,
      url: imageUrl,
    };
  } catch (err) {
    console.error('IPFS Upload Error:', err);
    throw err;
  }
}
