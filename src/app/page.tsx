"use client";

import { FC, useCallback, useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, Keypair } from "@solana/web3.js";
import toast from "react-hot-toast";
import { getTipJarBalance, sendTip, withdrawAll } from "../services/solana";
import { Wallet, Gift, DollarSign, AlertCircle, ExternalLink } from "lucide-react";

const Home: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [phantomInstalled, setPhantomInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Check if component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Check if Phantom wallet is installed
  useEffect(() => {
    const checkPhantomInstallation = () => {
      if (typeof window !== 'undefined') {
        const isPhantomInstalled = window.solana && window.solana.isPhantom;
        setPhantomInstalled(!!isPhantomInstalled);
      }
    };
    
    checkPhantomInstallation();
  }, []);
  
  // Get owner public key from private key
  const getOwnerPublicKey = () => {
    try {
      const privateKeyArray = JSON.parse(process.env.NEXT_PUBLIC_OWNER_PRIVATE_KEY || "[]");
      const keypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
      return keypair.publicKey;
    } catch {
      return null;
    }
  };
  
  const ownerPublicKey = getOwnerPublicKey();
const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID as string);

  const fetchBalance = useCallback(async () => {
    try {
      const balance = await getTipJarBalance(connection, programId);
      setBalance(balance / LAMPORTS_PER_SOL);
      
      if (publicKey && ownerPublicKey) {
        setIsOwner(publicKey.equals(ownerPublicKey));
      } else {
        setIsOwner(false);
      }
    } catch (error) {
      toast.error("⚠️ Failed to fetch tip jar balance");
      console.error(error);
    }
  }, [publicKey, connection, programId, ownerPublicKey]);

  const handleTip = async () => {
    if (!publicKey) {
      toast.error("🔒 Please connect your wallet first");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("🚀 Sending your tip...");
    
    try {
      await sendTip(connection, publicKey, programId, sendTransaction);
      toast.dismiss(loadingToast);
      toast.success("🎉 Tipped 0.01 SOL successfully! Thank you!");
      await fetchBalance();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("❌ Failed to send tip. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!isOwner) {
      toast.error("🚫 Only the owner can withdraw funds");
      return;
    }

    setWithdrawing(true);
    const loadingToast = toast.loading("💸 Withdrawing funds...");
    
    try {
      await withdrawAll(connection, publicKey!, programId, sendTransaction);
      toast.dismiss(loadingToast);
      toast.success("💰 All funds withdrawn successfully!");
      await fetchBalance();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("❌ Failed to withdraw funds. Please try again.");
      console.error(error);
    } finally {
      setWithdrawing(false);
    }
  };

  // Track wallet changes and update balance accordingly
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Handle wallet connection/disconnection
  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      setIsOwner(false);
      setLoading(false);
      setWithdrawing(false);
    } else {
      // Show success toast when wallet connects
      toast.success("✅ Wallet connected successfully!");
    }
  }, [publicKey]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Gift className="w-12 h-12 text-yellow-400 mr-2" />
              <h1 className="text-4xl font-bold text-white">Tip Jar</h1>
            </div>
            <p className="text-white/70 text-lg">Send tips on Solana Devnet</p>
          </div>
          
          <div className="mb-8">
            {mounted && (
              <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-pink-500 !rounded-xl !font-semibold !text-white !border-none !h-12 !w-full !flex !items-center !justify-center !text-base hover:!from-purple-600 hover:!to-pink-600 !transition-all !duration-200" />
            )}
          </div>
          
          {publicKey && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="w-6 h-6 text-green-400 mr-2" />
                    <span className="text-white font-medium">Balance</span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {balance !== null ? `${balance.toFixed(4)} SOL` : "Loading..."}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <button 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  onClick={handleTip}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Gift className="w-5 h-5 mr-2" />
                      Tip 0.01 SOL
                    </>
                  )}
                </button>
                
                {isOwner && (
                  <button 
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    onClick={handleWithdraw}
                    disabled={withdrawing || balance === 0}
                  >
                    {withdrawing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5 mr-2" />
                        Withdraw All
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {isOwner && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <p className="text-yellow-400 text-sm font-medium flex items-center">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                    You are the owner of this tip jar
                  </p>
                </div>
              )}
            </div>
          )}
          
          {!publicKey && (
            <div className="text-center">
              {!phantomInstalled ? (
                <div className="mb-6">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                      <p className="text-red-400 text-sm font-medium">Phantom Wallet Required</p>
                    </div>
                    <p className="text-red-300 text-sm mb-3">Please install Phantom wallet to use this app</p>
                    <a 
                      href="https://phantom.app/download" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      Install Phantom <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-white/70 mb-4">Connect your wallet to start tipping!</p>
              )}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white/50 text-sm">Network: Devnet</p>
              </div>
            </div>
          )}
        </div>
        
        <footer className="mt-8 text-center">
          <p className="text-white/50 text-sm">Built with Solana & Next.js</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
