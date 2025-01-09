import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import './App.css';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import SolanaApp from './components/SolanaApp';
import '@solana/wallet-adapter-react-ui/styles.css';
import { Toaster } from 'sonner';

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  return (
    <div style={{ width: '100vw' }}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <SolanaApp />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
