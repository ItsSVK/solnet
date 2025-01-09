import { useState, useEffect } from 'react';
import {
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, Send, Droplet, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { FloatingDock } from '@/components/ui/floating-dock';
import {
  IconBrandX,
  IconBrandGithub,
  IconBrandInstagram,
} from '@tabler/icons-react';

export default function SolanaApp() {
  const {
    wallet,
    publicKey,
    signMessage,
    sendTransaction,
    disconnect,
    connected,
    connect,
    connecting,
  } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [airdropAmount, setAirdropAmount] = useState('');
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(false);
  const { setVisible } = useWalletModal();

  const handleClick = async () => {
    if (connected) {
      // Disconnect if already connected
      await disconnect();
    } else {
      // Connect to the wallet
      try {
        setVisible(true);
      } catch (error) {
        console.error('Wallet connection failed', error);
      }
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [publicKey]);

  const fetchBalance = async (loader?: boolean) => {
    if (loader) setLoading(true);
    if (publicKey) {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
      if (loader) setLoading(false);
    }
  };

  const links = [
    {
      title: 'Instagram',
      icon: (
        <IconBrandInstagram className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: 'https://www.instagram.com/me_svk',
    },
    {
      title: 'Twitter',
      icon: (
        <IconBrandX className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: 'https://x.com/ShouvikMohanta',
    },
    {
      title: 'GitHub',
      icon: (
        <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: 'https://github.com/ItsSVK',
    },
  ];

  const handleTransfer = async () => {
    if (!publicKey || !sendTransaction || !recipient || !amount) return;
    setLoading(true);
    try {
      const recipientPubKey = new PublicKey(recipient);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );
      const blockhashResult = await connection.getLatestBlockhash('finalized');
      const { blockhash, lastValidBlockHeight } = blockhashResult;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(
        {
          signature, // Your transaction signature
          blockhash: blockhash,
          lastValidBlockHeight: lastValidBlockHeight,
        },
        'confirmed'
      );
      toast.success('Transfer successful!');
      setAmount('');
      setRecipient('');
      fetchBalance();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Transfer failed!');
    }
    setLoading(false);
  };

  const handleAirdrop = async () => {
    if (!publicKey || airdropAmount === '') return;
    setLoading(true);
    try {
      const signature = await connection.requestAirdrop(
        publicKey,
        parseFloat(airdropAmount) * LAMPORTS_PER_SOL
      );
      const blockhashResult = await connection.getLatestBlockhash('finalized');
      const { blockhash, lastValidBlockHeight } = blockhashResult;

      await connection.confirmTransaction(
        {
          signature,
          blockhash: blockhash,
          lastValidBlockHeight: lastValidBlockHeight,
        },
        'confirmed'
      );
      toast.success('Airdrop successful!');
      setAirdropAmount('');
      fetchBalance();
    } catch (error) {
      if ((error as Error).message.startsWith('429')) {
        toast.error('Airdrop limit exceeded. Please try again later.');
      } else {
        toast.error(`Airdrop failed: An unexpected error occurred.`);
      }
    }
    setLoading(false);
  };

  const handleSignMessage = async () => {
    if (!publicKey || !signMessage) return;
    setLoading(true);
    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await signMessage(encodedMessage);
      setSignature(signedMessage);
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Message signing failed!');
    }
    setLoading(false);
  };

  useEffect(() => {
    const connectWallet = async () => {
      if (wallet && !connected) {
        try {
          await connect();
          console.log(`Connected to wallet: ${wallet.adapter.name}`);
        } catch (error) {
          console.error('Wallet connection failed', error);
        }
      }
    };

    connectWallet();
  }, [wallet, connected, connect]);

  const BottomGradient = () => {
    return (
      <>
        <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
      </>
    );
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Solana Network | SolNet
        </h1>
        <div>
          <div className="flex justify-center">
            <button
              className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block"
              onClick={handleClick}
              disabled={connecting}
            >
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </span>
              <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-2 px-4 ring-1 ring-white/10 ">
                <span>
                  {connected
                    ? 'Disconnect Wallet'
                    : connecting
                    ? 'Connecting...'
                    : 'Connect Wallet'}
                </span>
                {!connected && (
                  <svg
                    fill="none"
                    height="16"
                    viewBox="0 0 24 24"
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.75 8.75L14.25 12L10.75 15.25"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                  </svg>
                )}
              </div>
              <span className="absolute -bottom-0 left-[1.125rem] h-3 w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
            </button>
          </div>
          {publicKey && (
            <div className="space-y-6 mt-6">
              <div className="flex bg-gray-700 p-3 rounded-lg">
                <div>
                  <div>
                    <span className="text-gray-300">Connected:</span>
                    <span className="font-bold text-sm text-blue-400">
                      {balance !== null
                        ? `${wallet?.adapter.publicKey?.toBase58()}`
                        : 'Loading...'}
                    </span>
                  </div>
                  <div className="flex justify-start items-center gap-6">
                    <span className="text-gray-300">Balance:</span>
                    <span className="font-semibold text-sm text-blue-400">
                      {balance !== null
                        ? `${balance.toFixed(4)} SOL`
                        : 'Loading...'}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fetchBalance(true)}
                        disabled={loading}
                        className="text-gray-300 hover:text-white"
                      >
                        <RefreshCw
                          className={` ${loading ? 'animate-spin' : ''}`}
                        />
                      </Button>
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipient" className="text-gray-300">
                    Air Drop
                  </Label>
                  <div className="flex gap-3">
                    <Input
                      id="recipient"
                      placeholder="Enter Amount"
                      type="number"
                      value={airdropAmount}
                      onChange={e => setAirdropAmount(e.target.value)}
                      className="bg-gray-800 text-white rounded flex-1"
                    />
                    <Button
                      className="w-full flex-1 relative group/btn bg-zinc-800 text-white rounded h-11 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                      onClick={handleAirdrop}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Droplet className="mr-2 h-4 w-4" />
                      )}
                      Airdrop SOL
                      <BottomGradient />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="recipient" className="text-gray-300">
                    Recipient Address
                  </Label>
                  <Input
                    id="recipient"
                    placeholder="Enter recipient's address"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    className="bg-gray-800 text-white rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="amount" className="text-gray-300">
                    Amount (SOL)
                  </Label>
                  <div className="flex gap-3">
                    <Input
                      id="amount"
                      placeholder="Enter amount"
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="bg-gray-800 text-white rounded flex-1"
                    />
                    <Button
                      className="w-full flex-1 relative group/btn bg-zinc-800 text-white rounded h-11 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                      onClick={handleTransfer}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Transfer SOL
                      <BottomGradient />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="message" className="text-gray-300">
                    Message to Sign
                  </Label>
                  <Input
                    id="message"
                    placeholder="Enter a message to sign"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="bg-gray-800 text-white rounded"
                  />
                </div>
                <Button
                  className="w-full relative group/btn bg-zinc-800 text-white rounded h-11 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                  onClick={handleSignMessage}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PenTool className="mr-2 h-4 w-4" />
                  )}
                  Sign Message
                </Button>
              </div>
              {signature && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-gray-700 rounded-lg overflow-auto"
                >
                  <p className="text-xs break-all text-gray-300">
                    Signature:{' '}
                    <span className="text-green-400">
                      {Buffer.from(signature).toString('hex')}
                    </span>
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
      <div className="flex items-center justify-center w-full absolute bottom-4">
        <FloatingDock items={links} />
      </div>
    </div>
  );
}
