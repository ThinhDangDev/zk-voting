import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet, AlertCircle } from "lucide-react";

interface WalletConnectProps {
  isConnected: boolean;
  isConnecting: boolean;
  account: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  error?: string | null;
}

export const WalletConnect = ({
  isConnected,
  isConnecting,
  account,
  onConnect,
  onDisconnect,
  error,
}: WalletConnectProps) => {
  if (isConnected && account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connected
          </CardTitle>
          <CardDescription>
            You're connected to the ZK Voting system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Address:</p>
              <p className="font-mono text-sm break-all">{account}</p>
            </div>
            <Button variant="outline" onClick={onDisconnect} className="w-full">
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </CardTitle>
        <CardDescription>
          Connect your MetaMask wallet to start voting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <Button
            onClick={onConnect}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? "Connecting..." : "Connect MetaMask"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Make sure you have MetaMask installed in your browser
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
