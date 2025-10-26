import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useZkVoting } from "@/hooks/useZkVoting";
import { WalletConnect } from "@/components/WalletConnect";
import { CreateProposalForm } from "@/components/CreateProposalForm";
import { ProposalCard } from "@/components/ProposalCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, AlertCircle, Vote } from "lucide-react";

function App() {
  const {
    account,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    signer,
  } = useWallet();

  const {
    proposals,
    loading,
    error: zkVotingError,
    fetchProposals,
    createProposal,
    vote,
    getResults,
  } = useZkVoting(signer);

  const [isVoting, setIsVoting] = useState(false);

  // Load proposals when wallet connects
  useEffect(() => {
    if (isConnected) {
      fetchProposals();
    }
  }, [isConnected]);

  const handleCreateProposal = async (data: {
    candidates: string[];
    voters: string[];
    metadata: string;
    startTime: number;
    endTime: number;
  }) => {
    try {
      return await createProposal(data);
    } catch (error) {
      console.error("Failed to create proposal:", error);
      throw error;
    }
  };

  const handleVote = async (proposalId: number, candidate: string) => {
    if (!account) return;

    setIsVoting(true);
    try {
      return await vote(proposalId, candidate, account);
    } catch (error) {
      console.error("Failed to vote:", error);
      throw error;
    } finally {
      setIsVoting(false);
    }
  };

  const handleGetResults = async (proposalId: number) => {
    try {
      return await getResults(proposalId);
    } catch (error) {
      console.error("Failed to get results:", error);
      throw error;
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Vote className="h-16 w-16 mx-auto text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ZK Voting System
            </h1>
            <p className="text-gray-600">
              Secure, private voting on blockchain
            </p>
          </div>
          <WalletConnect
            isConnected={isConnected}
            isConnecting={isConnecting}
            account={account}
            onConnect={connectWallet}
            onDisconnect={disconnectWallet}
            error={null}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Vote className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ZK Voting System
          </h1>
          <p className="text-gray-600">Secure, private voting on blockchain</p>
        </div>

        {/* Wallet Info */}
        <div className="mb-8">
          <WalletConnect
            isConnected={isConnected}
            isConnecting={isConnecting}
            account={account}
            onConnect={connectWallet}
            onDisconnect={disconnectWallet}
            error={null}
          />
        </div>

        {/* Error Display */}
        {zkVotingError && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{zkVotingError}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Proposal */}
        <div className="mb-8">
          <CreateProposalForm
            onCreateProposal={handleCreateProposal}
            isLoading={loading}
          />
        </div>

        {/* Proposals List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">Proposals</h2>
            <Button
              onClick={fetchProposals}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 mx-auto animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-600">Loading proposals...</p>
                </div>
              </CardContent>
            </Card>
          ) : proposals.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Vote className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No proposals found
                  </h3>
                  <p className="text-gray-600">
                    Create your first proposal to get started
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {proposals.map((proposal, index) => (
                <ProposalCard
                  key={index}
                  proposal={proposal}
                  proposalId={index}
                  onVote={handleVote}
                  onGetResults={handleGetResults}
                  voterAddress={account!}
                  isVoting={isVoting}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
