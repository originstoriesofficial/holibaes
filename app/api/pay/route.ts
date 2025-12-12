import { NextRequest, NextResponse } from "next/server";

/**
 * Coinbase x402 Facilitator endpoint
 * This example charges 2.25 USDC on Base before minting.
 */

export async function POST(req: NextRequest) {
  try {
    // 🔒 Verify payment proof if the client already sent one
    const paymentProof = req.headers.get("x402-payment-proof");
    const verified = paymentProof && await verifyPayment(paymentProof);

    if (!verified) {
      // 🧾 Return 402 with payment instructions
      return new NextResponse("Payment Required", {
        status: 402,
        headers: {
          "x402-payment-instructions": JSON.stringify({
            facilitator: "https://api.developer.coinbase.com/x402",
            amount: "2.25",
            currency: "USDC",
            network: "base",
            receiver: process.env.RECEIVER_WALLET, // e.g., your app or merchant wallet
            description: "Mint a Monk NFT",
          }),
        },
      });
    }

    // ✅ Payment verified — continue to mint
    return NextResponse.json({
      success: true,
      message: "Payment verified. Proceed to mint.",
    });
  } catch (err) {
    console.error("x402 pay error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** 
 * Mock verifier — replace with Coinbase Facilitator verification 
 * https://docs.cdp.coinbase.com/x402
 */
async function verifyPayment(paymentProof: string): Promise<boolean> {
  // For now, simulate “valid” payment if proof string is present
  // Later, call Coinbase Facilitator API to confirm settlement.
  return Boolean(paymentProof);
}
