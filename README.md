# Solana Tip Jar

A beautiful tip jar application built on Solana Devnet using Next.js, TypeScript, and Tailwind CSS.

## Features

- 🔐 **Phantom Wallet Integration**: Connect your Phantom wallet to interact with the tip jar
- 💰 **View Balance**: See the current balance of the tip jar in real-time
- 🎁 **Send Tips**: Send 0.01 SOL tips to the tip jar
- 📤 **Withdraw Funds**: Owner can withdraw all funds from the tip jar
- 🎨 **Beautiful UI**: Modern, responsive design with glass morphism effects
- 🔔 **Toast Notifications**: Real-time feedback for all actions
- 🛡️ **Error Handling**: Comprehensive error handling and user feedback

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Blockchain**: Solana (Devnet)
- **Wallet**: Phantom Wallet Adapter
- **UI Components**: Lucide React icons, React Hot Toast
- **Smart Contract**: Rust with Anchor Framework

## Program Details

- **Program ID**: Configurable via environment variables
- **Network**: Devnet (configurable)
- **RPC Endpoint**: Configurable via environment variables
- **Tip Jar Account**: Configurable via environment variables

## Getting Started

### Prerequisites

- Node.js 18+ 
- Phantom wallet browser extension
- Some SOL in your wallet on Devnet

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tip-jar-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=your_deployed_program_id
NEXT_PUBLIC_TIP_JAR_ACCOUNT=your_tip_jar_account_address
NEXT_PUBLIC_OWNER_PRIVATE_KEY=[your-private-key-array]
```

**Environment Variable Details:**
- `NEXT_PUBLIC_SOLANA_NETWORK`: Network to connect to (devnet, testnet, mainnet-beta)
- `NEXT_PUBLIC_SOLANA_RPC_URL`: RPC endpoint URL for Solana network
- `NEXT_PUBLIC_PROGRAM_ID`: Your deployed Solana program ID
- `NEXT_PUBLIC_TIP_JAR_ACCOUNT`: The tip jar account address (PDA or initialized account)
- `NEXT_PUBLIC_OWNER_PRIVATE_KEY`: Owner's private key as JSON array for withdraw permissions

**Example:**
```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=22v3VAtU3BhYvmQwDsypAmjVeyWDR6RbdUnsCTwgdLNA
NEXT_PUBLIC_TIP_JAR_ACCOUNT=C7iudfXD6GLocNBiP5BHrXKo4VWwcTBAvH6Jw5B3Pt3f
NEXT_PUBLIC_OWNER_PRIVATE_KEY=[1,2,3,4,5,...] // Your 64-byte private key array
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Connect Wallet**: Click the "Connect Wallet" button to connect your Phantom wallet
2. **View Balance**: The current tip jar balance will be displayed
3. **Send Tips**: Click "Tip 0.01 SOL" to send a tip
4. **Withdraw (Owner Only)**: If you're the owner, you'll see a "Withdraw All" button

## Smart Contract

The smart contract is written in Rust using the Anchor framework and includes:

- **Initialize**: Create a new tip jar with an owner
- **Tip**: Accept tips from any user
- **Withdraw**: Allow only the owner to withdraw all funds

### Contract Functions

- `initialize_tip_jar(owner: Pubkey)`: Initialize a new tip jar
- `tip(amount: u64)`: Send a tip to the jar
- `withdraw(destination: Pubkey)`: Withdraw all funds (owner only)

## Security Features

- Owner verification for withdrawals
- Input validation for all transactions
- Secure lamport transfers
- Error handling for all edge cases

## Deployment

The application can be deployed to:
- Vercel (recommended)
- Netlify
- GitHub Pages

Simply connect your repository to your preferred hosting platform.

## Configuration

### Environment Variables

The application is fully configurable through environment variables. No hardcoded addresses or keys are used in the codebase.

**Required Variables:**
- `NEXT_PUBLIC_PROGRAM_ID`: Your deployed Solana program ID
- `NEXT_PUBLIC_TIP_JAR_ACCOUNT`: The tip jar account address
- `NEXT_PUBLIC_OWNER_PRIVATE_KEY`: Owner's private key for withdraw functionality

**Optional Variables:**
- `NEXT_PUBLIC_SOLANA_NETWORK`: Network (default: devnet)
- `NEXT_PUBLIC_SOLANA_RPC_URL`: Custom RPC endpoint

### Deployment Steps

1. **Deploy Smart Contract**: Deploy the tip jar program to Solana
2. **Initialize Tip Jar**: Create and initialize the tip jar account
3. **Update Environment**: Set all required environment variables
4. **Deploy Frontend**: Deploy to your preferred hosting platform

### Network Switching

To switch networks (devnet ↔ testnet ↔ mainnet):
1. Update `NEXT_PUBLIC_SOLANA_NETWORK`
2. Update `NEXT_PUBLIC_SOLANA_RPC_URL`
3. Update `NEXT_PUBLIC_PROGRAM_ID` to the program ID on the new network
4. Update `NEXT_PUBLIC_TIP_JAR_ACCOUNT` to the tip jar account on the new network

## Known Issues & Limitations

- Requires manual initialization of the tip jar account
- Limited to 0.01 SOL tips (can be modified in the smart contract)
- Owner private key must be in JSON array format
- Phantom wallet extension required for full functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue in the repository.
