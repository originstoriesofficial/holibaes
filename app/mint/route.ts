import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@farcaster/quick-auth";
import { baseSepolia } from "viem/chains";
import { encodeFunctionData } from "viem";
import { MintContractABI } from "../lib/abi/mintContract";
import { CONTRACTS } from "../lib/contracts";

/**
 * x402 Integration:
 * - Requires client to pay 0.5 USDC via Coinbase Facilitator before minting.
 * - Facilitator handles settlement automatically; no private keys on your backend.
 * - Works with Base Paymaster for gasless user mints.
 */

const domain = process.env.NEXT_PUBLIC_DOMAIN!;
const client = createClient();

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const payload = await client.verifyJwt({ token, domain });
    const fid = payload.sub;

    // Parse body (keep metadata fields for future use)
    const {
      tokenURI,
      image: _image,
      animal: _animal,
      cape: _cape,
      hand: _hand,
    } = await req.json();

    /**
     * 1️⃣ Require payment if user hasn't paid
     */
    const hasPaid = req.headers.get("x402-payment-proof");
    if (!hasPaid) {
      return new NextResponse(
        JSON.stringify({
          error: "Payment Required",
          payment: {
            facilitator_url: "https://api.developer.coinbase.com/x402/base-sepolia",
            amount: "0.5",
            asset: "USDC",
            to: CONTRACTS.receiverWallet,
            memo: `mint:${fid}`,
          },
        }),
        { status: 402, headers: { "Content-Type": "application/json" } }
      );
    }

    /**
     * 2️⃣ (Optional) Validate payment server-side (skipped here)
     */

    /**
     * 3️⃣ Encode mint call (user signs it client-side)
     */
    const data = encodeFunctionData({
      abi: MintContractABI,
      functionName: "mint",
      args: [tokenURI || `ipfs://example/${fid}`, BigInt(1)],
    });

    return NextResponse.json({
      success: true,
      chainId: baseSepolia.id,
      mintCall: {
        to: CONTRACTS.mintContract,
        data,
        value: "0",
        isSponsored: true,
      },
      message: "Payment verified. Ready to mint.",
    });
  } catch (err) {
    console.error("Mint route error:", err);
    return NextResponse.json({ error: "Minting failed" }, { status: 500 });
  }
}
