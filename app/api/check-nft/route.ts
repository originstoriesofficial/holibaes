// app/api/check-nft/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  createPublicClient,
  http,
  Address,
  parseAbi,
  formatUnits,
} from "viem";
import { base } from "viem/chains";

const ORIGIN_CONTRACT: Address =
  "0x45737f6950f5c9e9475e9e045c7a89b565fa3648";

const originStoryAbi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
]);

// 🧮 Adjust if your token uses a different number of decimals
const DECIMALS = 18n;
const MIN_REQUIRED_TOKENS = 3500n;
const MIN_REQUIRED_RAW = MIN_REQUIRED_TOKENS * 10n ** DECIMALS;

const client = createPublicClient({
  chain: base,
  transport: http(
    process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || ""
  ),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Missing address" },
      { status: 400 }
    );
  }

  try {
    const balance = (await client.readContract({
      address: ORIGIN_CONTRACT,
      abi: originStoryAbi,
      functionName: "balanceOf",
      args: [address as Address],
    })) as bigint;

    const eligible = balance >= MIN_REQUIRED_RAW;
    const balanceFormatted = formatUnits(balance, Number(DECIMALS));

    return NextResponse.json({
      eligible,
      balance: balanceFormatted,
      minRequired: Number(MIN_REQUIRED_TOKENS),
    });
  } catch (error) {
    console.error("check-nft error:", error);
    return NextResponse.json(
      { error: "Failed to check OriginStory balance" },
      { status: 500 }
    );
  }
}
