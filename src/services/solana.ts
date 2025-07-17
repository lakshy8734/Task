import {
  Connection,
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL,
  Keypair,
  SystemProgram,
} from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@project-serum/anchor";
import BN from 'bn.js';
import idl from "../../idl.json";

// IDL type
type TipJarIdl = typeof idl;

// For demo purposes, we'll use a hardcoded tip jar account
// In production, you would derive this properly or get it from the program
let tipJarAccount: PublicKey;

// Initialize the tip jar account (you would call this once)
export const initializeTipJarAccount = () => {
  // For demo purposes, we'll generate a keypair
  // In production, this should be derived deterministically
  const keypair = Keypair.generate();
  tipJarAccount = keypair.publicKey;
  return keypair;
};

// Get tip jar account
export const getTipJarAccount = (): PublicKey => {
  if (!tipJarAccount) {
    // Use tip jar account from environment variable or fallback
    const tipJarAccountEnv = process.env.NEXT_PUBLIC_TIP_JAR_ACCOUNT;
    if (!tipJarAccountEnv) {
      console.warn("NEXT_PUBLIC_TIP_JAR_ACCOUNT not set, using fallback");
      tipJarAccount = new PublicKey("8YZqJJXQNMBhGVyNLBGLJGfbKvwDCLmvjhBEhMYbcKmE");
    } else {
      tipJarAccount = new PublicKey(tipJarAccountEnv);
    }
  }
  return tipJarAccount;
};

// Create a dummy wallet for anchor provider
const createDummyWallet = () => {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey,
    signTransaction: async (tx: Transaction) => {
      tx.partialSign(keypair);
      return tx;
    },
    signAllTransactions: async (txs: Transaction[]) => {
      return txs.map((tx) => {
        tx.partialSign(keypair);
        return tx;
      });
    },
  };
};

// Get Anchor program
const getProgram = (connection: Connection, wallet?: any) => {
  const provider = new AnchorProvider(
    connection,
    wallet || createDummyWallet(),
    { commitment: "confirmed" }
  );
  return new Program(idl as TipJarIdl, process.env.NEXT_PUBLIC_PROGRAM_ID!, provider);
};

// Get tip jar balance
export const getTipJarBalance = async (
  connection: Connection,
  programId: PublicKey
): Promise<number> => {
  try {
    const tipJarPubkey = getTipJarAccount();
    const balance = await connection.getBalance(tipJarPubkey);
    return balance;
  } catch (error) {
    console.error("Error fetching tip jar balance:", error);
    return 0;
  }
};

// Send tip using Anchor
export const sendTip = async (
  connection: Connection,
  userPublicKey: PublicKey,
  programId: PublicKey,
  sendTransaction: WalletContextState["sendTransaction"]
): Promise<void> => {
  try {
    const tipJarPubkey = getTipJarAccount();
    const tipAmount = 0.01 * LAMPORTS_PER_SOL;

    // Create wallet object for Anchor
    const wallet = {
      publicKey: userPublicKey,
      signTransaction: async (tx: Transaction) => {
        return await sendTransaction(tx, connection);
      },
      signAllTransactions: async (txs: Transaction[]) => {
        const signedTxs = [];
        for (const tx of txs) {
          signedTxs.push(await sendTransaction(tx, connection));
        }
        return signedTxs;
      },
    };

    const program = getProgram(connection, wallet);
    
    // Use Anchor to call the tip function
    const tx = await program.methods
      .tip(new BN(tipAmount))
      .accounts({
        tipJar: tipJarPubkey,
        tipper: userPublicKey,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    const signature = await sendTransaction(tx, connection);
    await connection.confirmTransaction(signature, "confirmed");
  } catch (error) {
    console.error("Error sending tip:", error);
    throw error;
  }
};

// Withdraw all funds (owner only) using Anchor
export const withdrawAll = async (
  connection: Connection,
  ownerPublicKey: PublicKey,
  programId: PublicKey,
  sendTransaction: WalletContextState["sendTransaction"]
): Promise<void> => {
  try {
    const tipJarPubkey = getTipJarAccount();

    // Create wallet object for Anchor
    const wallet = {
      publicKey: ownerPublicKey,
      signTransaction: async (tx: Transaction) => {
        return await sendTransaction(tx, connection);
      },
      signAllTransactions: async (txs: Transaction[]) => {
        const signedTxs = [];
        for (const tx of txs) {
          signedTxs.push(await sendTransaction(tx, connection));
        }
        return signedTxs;
      },
    };

    const program = getProgram(connection, wallet);
    
    // Use Anchor to call the withdraw function
    const tx = await program.methods
      .withdraw(ownerPublicKey)
      .accounts({
        tipJar: tipJarPubkey,
        owner: ownerPublicKey,
        destination: ownerPublicKey,
      })
      .transaction();

    const signature = await sendTransaction(tx, connection);
    await connection.confirmTransaction(signature, "confirmed");
  } catch (error) {
    console.error("Error withdrawing funds:", error);
    throw error;
  }
};

// Initialize tip jar using Anchor
export const initializeTipJar = async (
  connection: Connection,
  payer: Keypair,
  ownerPublicKey: PublicKey,
  programId: PublicKey
): Promise<PublicKey> => {
  try {
    const tipJarKeypair = initializeTipJarAccount();
    const tipJarPubkey = tipJarKeypair.publicKey;

    // Create wallet object for Anchor
    const wallet = {
      publicKey: payer.publicKey,
      signTransaction: async (tx: Transaction) => {
        tx.partialSign(payer);
        return tx;
      },
      signAllTransactions: async (txs: Transaction[]) => {
        return txs.map((tx) => {
          tx.partialSign(payer);
          return tx;
        });
      },
    };

    const program = getProgram(connection, wallet);
    
    // Use Anchor to call the initialize function
    await program.methods
      .initializeTipJar(ownerPublicKey)
      .accounts({
        tipJar: tipJarPubkey,
        payer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([payer, tipJarKeypair])
      .rpc();

    return tipJarPubkey;
  } catch (error) {
    console.error("Error initializing tip jar:", error);
    throw error;
  }
};
