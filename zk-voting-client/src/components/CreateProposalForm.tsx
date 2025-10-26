import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface CreateProposalFormProps {
  onCreateProposal: (data: {
    candidates: string[];
    voters: string[];
    metadata: string;
    startTime: number;
    endTime: number;
  }) => Promise<string>;
  isLoading?: boolean;
}

export const CreateProposalForm = ({
  onCreateProposal,
  isLoading,
}: CreateProposalFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    metadata: "",
    candidates: [""],
    voters: [""],
    duration: 24, // hours
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const now = Math.floor(Date.now() / 1000);
      await onCreateProposal({
        candidates: formData.candidates.filter((c) => c.trim()),
        voters: formData.voters.filter((v) => v.trim()),
        metadata: formData.metadata,
        startTime: now,
        endTime: now + formData.duration * 3600,
      });

      setFormData({
        candidates: [""],
        voters: [""],
        metadata: "",
        duration: 24,
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create proposal:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const addCandidate = () => {
    setFormData((prev) => ({
      ...prev,
      candidates: [...prev.candidates, ""],
    }));
  };

  const removeCandidate = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      candidates: prev.candidates.filter((_, i) => i !== index),
    }));
  };

  const updateCandidate = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c, i) => (i === index ? value : c)),
    }));
  };

  const addVoter = () => {
    setFormData((prev) => ({
      ...prev,
      voters: [...prev.voters, ""],
    }));
  };

  const removeVoter = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      voters: prev.voters.filter((_, i) => i !== index),
    }));
  };

  const updateVoter = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      voters: prev.voters.map((v, i) => (i === index ? value : v)),
    }));
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full"
        disabled={isLoading}
      >
        <Plus className="h-4 w-4 mr-2" />
        Create New Proposal
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Proposal</CardTitle>
        <CardDescription>
          Set up a new voting proposal with candidates and eligible voters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="metadata">Description</Label>
            <Input
              id="metadata"
              value={formData.metadata}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, metadata: e.target.value }))
              }
              placeholder="What is this vote about?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Candidates</Label>
            <div className="space-y-2">
              {formData.candidates.map((candidate, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={candidate}
                    onChange={(e) => updateCandidate(index, e.target.value)}
                    placeholder={`Candidate ${index + 1} address`}
                    required
                  />
                  {formData.candidates.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeCandidate(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addCandidate}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Eligible Voters</Label>
            <div className="space-y-2">
              {formData.voters.map((voter, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={voter}
                    onChange={(e) => updateVoter(index, e.target.value)}
                    placeholder={`Voter ${index + 1} address`}
                    required
                  />
                  {formData.voters.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeVoter(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addVoter}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Voter
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (hours)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  duration: parseInt(e.target.value) || 24,
                }))
              }
              min="1"
              max="168"
              required
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? "Creating..." : "Create Proposal"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
