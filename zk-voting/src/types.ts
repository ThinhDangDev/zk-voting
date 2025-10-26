export type Proposal = {
  merkleRoot: string;
  metadata: string;
  ballotBoxes: [bigint, bigint][];
  startDate: bigint;
  endDate: bigint;
  randomNumbers: bigint[];
  candidates: string[];
  commitment: bigint;
};
