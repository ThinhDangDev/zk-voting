import { useState, useEffect } from "react";
import { ZkVoting } from "@/lib/zk-voting/core";
import type { Proposal } from "@/lib/zk-voting/types";
import { Leaf } from "@/lib/zk-voting/leaf";
import { config } from "@/lib/config";

export const useZkVoting = (signer: any) => {
  const [zkVoting, setZkVoting] = useState<ZkVoting | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("signer", signer);
  console.log("config.contractAddress", config.contractAddress);
  console.log("zkVoting", zkVoting);
  console.log("proposals", [proposals]);

  useEffect(() => {
    if (signer) {
      try {
        const contract = new ZkVoting({
          wallet: signer,
          contractAddress: config.contractAddress,
        });
        setZkVoting(contract);
        setError(null);
      } catch (err) {
        setError("Failed to initialize ZK Voting contract");
        console.error(err);
      }
    } else {
      setZkVoting(null);
    }
  }, [signer]);

  const fetchProposals = async () => {
    if (!zkVoting) return;

    setLoading(true);
    setError(null);
    try {
      const proposals = await zkVoting.getProposals();
      console.log("proposals", proposals);
      setProposals(proposals);
    } catch (err) {
      setError("Failed to fetch proposals");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (data: {
    candidates: string[];
    voters: string[];
    metadata: string;
    startTime: number;
    endTime: number;
  }) => {
    if (!zkVoting) throw new Error("ZK Voting not initialized");

    setError(null);
    try {
      const encoder = new TextEncoder();
      const metadata = encoder.encode(data.metadata);
      const txHash = await zkVoting.initializeProposal({
        ...data,
        metadata,
      });

      console.log("Proposal created:", txHash);
      await fetchProposals();
      return txHash;
    } catch (err) {
      setError("Failed to create proposal");
      console.error(err);
      throw err;
    }
  };

  const vote = async (
    proposalId: number,
    candidate: string,
    voterAddress: string
  ) => {
    if (!zkVoting) throw new Error("ZK Voting not initialized");

    setError(null);
    try {
      // Get voter list from proposal (in real app, this would be stored separately)
      const voters = [
        "0xB64CfeC4181f8ACd1BD215a967cAfd6f18cefD78",
        "0x6A3D5A4698d28470543a9F17296B29a69460b74a",
        "0x7D6d1F070F536E1b18ec32E3cFc722DEFcc0821f",
      ];

      const merkleDistributor = zkVoting.getMerkleDistributor(voters);
      const proof = merkleDistributor.prove(new Leaf(voterAddress));
      console.log("proof", proof);

      const txHash = await zkVoting.vote({
        proposalId,
        proof,
        votFor: candidate,
        owner: voterAddress,
      });

      console.log("Vote submitted:", txHash);
      return txHash;
    } catch (err) {
      setError("Failed to vote: " + (err as Error).message);
      console.error(err);
      throw err;
    }
  };

  const getResults = async (proposalId: number) => {
    if (!zkVoting) throw new Error("ZK Voting not initialized");

    setError(null);
    try {
      const results = await zkVoting.getWinner({ proposalId });
      return results;
    } catch (err) {
      setError("Failed to get results");
      console.error(err);
      throw err;
    }
  };

  return {
    zkVoting,
    proposals,
    loading,
    error,
    fetchProposals,
    createProposal,
    vote,
    getResults,
  };
};
