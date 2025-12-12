// constants/monkeriaContract.ts
import type { Address } from "viem";

export const MONKERIA_CONTRACT_ADDRESS =
  "0x3D1E34Aa63d26f7b1307b96a612a40e5F8297AC7" as Address;

export const monkeriaAbi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "payable",
    inputs: [
      { name: "_tokenURI", type: "string" },
      { name: "quantity", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getMintPrice",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
