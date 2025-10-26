import { useState, useEffect } from "react";
import { ethers } from "ethers";

interface WalletState {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  isConnected: boolean;
  isConnecting: boolean;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    account: null,
    provider: null,
    signer: null,
    isConnected: false,
    isConnecting: false,
  });

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask is not installed");
    }

    setWallet((prev) => ({ ...prev, isConnecting: true }));

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setWallet({
        account: address,
        provider,
        signer,
        isConnected: true,
        isConnecting: false,
      });

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          setWallet({
            account: null,
            provider: null,
            signer: null,
            isConnected: false,
            isConnecting: false,
          });
        } else {
          connectWallet();
        }
      });

      // Listen for chain changes
      window.ethereum.on("chainChanged", () => {
        connectWallet();
      });
    } catch (error) {
      setWallet((prev) => ({ ...prev, isConnecting: false }));
      throw error;
    }
  };

  const disconnectWallet = () => {
    setWallet({
      account: null,
      provider: null,
      signer: null,
      isConnected: false,
      isConnecting: false,
    });
  };

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setWallet({
              account: address,
              provider,
              signer,
              isConnected: true,
              isConnecting: false,
            });
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkConnection();
  }, []);

  return {
    ...wallet,
    connectWallet,
    disconnectWallet,
  };
};
