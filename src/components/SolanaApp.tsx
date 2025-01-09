import { useState, useEffect } from 'react';
import {
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
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
  const { publicKey, signMessage, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [airdropAmount, setAirdropAmount] = useState('');
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Solana Network | SolNet
        </h1>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
          <div className="flex justify-center">
            <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !text-white font-bold py-2 px-4 rounded" />
          </div>
          {publicKey && (
            <div className="space-y-6 mt-6">
              <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                <span className="text-gray-300">Balance:</span>
                <span className="font-bold text-blue-400">
                  {balance !== null
                    ? `${balance.toFixed(4)} SOL`
                    : 'Loading...'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fetchBalance(true)}
                  disabled={loading}
                  className="text-gray-300 hover:text-white"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                  />
                </Button>
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
                      className="bg-gray-700 border-gray-600 text-white rounded"
                    />
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={handleAirdrop}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Droplet className="mr-2 h-4 w-4" />
                      )}
                      Airdrop SOL
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
                    className="bg-gray-700 border-gray-600 text-white rounded"
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
                      className="bg-gray-700 border-gray-600 text-white rounded"
                    />
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleTransfer}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Transfer SOL
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
                    className="bg-gray-700 border-gray-600 text-white rounded"
                  />
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
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
