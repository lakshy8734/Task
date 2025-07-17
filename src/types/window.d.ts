interface Window {
  solana?: {
    isPhantom?: boolean;
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
    signTransaction: (transaction: any) => Promise<any>;
    signAllTransactions: (transactions: any[]) => Promise<any[]>;
    signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
    request: (method: string, params?: any) => Promise<any>;
    on: (event: string, handler: (args: any) => void) => void;
    removeListener: (event: string, handler: (args: any) => void) => void;
  };
}
