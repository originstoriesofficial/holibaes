export const MintContractABI = [
  {
    inputs: [
      { name: "_tokenURI", type: "string" },
      { name: "quantity", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;
