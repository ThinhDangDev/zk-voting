import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Proposal } from "@/lib/zk-voting/types";
import { Clock, Users, Vote, BarChart3, CheckCircle } from "lucide-react";

interface ProposalCardProps {
  proposal: Proposal;
  proposalId: number;
  onVote: (proposalId: number, candidate: string) => Promise<string>;
  onGetResults: (proposalId: number) => Promise<number[]>;
  voterAddress: string;
  isVoting?: boolean;
}

export const ProposalCard = ({
  proposal,
  proposalId,
  onVote,
  onGetResults,
  voterAddress,
  isVoting = false,
}: ProposalCardProps) => {
  const [results, setResults] = useState<number[] | null>(null);
  const [gettingResults, setGettingResults] = useState(false);
  const [votingFor, setVotingFor] = useState<string | null>(null);

  const now = Math.floor(Date.now() / 1000);
  const isActive = now < Number(proposal.endDate);
  const hasStarted = now >= Number(proposal.startDate);

  const handleVote = async (candidate: string) => {
    setVotingFor(candidate);
    try {
      await onVote(proposalId, candidate);
    } catch (error) {
      console.error("Vote failed:", error);
    } finally {
      setVotingFor(null);
    }
  };

  const handleGetResults = async () => {
    setGettingResults(true);
    try {
      const res = await onGetResults(proposalId);
      setResults(res);
    } catch (error) {
      console.error("Failed to get results:", error);
    } finally {
      setGettingResults(false);
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const getStatusBadge = () => {
    if (!hasStarted) {
      return <Badge variant="secondary">Not Started</Badge>;
    }
    if (isActive) {
      return <Badge variant="default">Active</Badge>;
    }
    return <Badge variant="outline">Ended</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Proposal #{proposalId}
            </CardTitle>
            <CardDescription className="mt-2">
              {proposal.metadata}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Start: {formatDate(proposal.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>End: {formatDate(proposal.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Candidates: {proposal.candidates.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Merkel Roots: {proposal.merkleRoot}</span>
          </div>
        </div>

        {/* {isActive && hasStarted ? ( */}
        <div className="space-y-4">
          <h4 className="font-medium">Cast Your Vote:</h4>
          <div className="grid gap-2">
            {proposal.candidates.map((candidate, index) => (
              <Button
                key={index}
                onClick={() => handleVote(candidate)}
                disabled={isVoting || votingFor === candidate}
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="text-left">
                    <div className="font-mono text-sm">{candidate}</div>
                    <div className="text-xs text-muted-foreground">
                      Candidate {index + 1}
                    </div>
                  </div>
                  {votingFor === candidate && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </Button>
            ))}
          </div>
          {isVoting && (
            <p className="text-sm text-blue-600 text-center">
              Submitting vote...
            </p>
          )}
        </div>
        {/* // ) : ( */}
        <div className="space-y-4">
          <Button
            onClick={handleGetResults}
            disabled={gettingResults}
            className="w-full"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {gettingResults ? "Getting Results..." : "View Results"}
          </Button>

          {results && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Results:
              </h4>
              {results.map((votes, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">Candidate {index + 1}:</span>
                  <Badge variant="secondary">{votes} votes</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* )} */}
      </CardContent>
    </Card>
  );
};
