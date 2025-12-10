import { useState, useEffect, createContext, useContext } from 'react';
import { motion } from 'motion/react';
import { Home, ArrowLeftRight, Wallet, Bot, User } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { HomePage } from './components/buckget/HomePage';
import { TransferPage } from './components/buckget/TransferPage';
import { BucketsPage } from './components/buckget/BucketsPage';
import { AIAgent } from './components/buckget/AIAgent';
import { ProfilePage } from './components/buckget/ProfilePage';
import { LandingPage } from './components/buckget/LandingPage';
import { LoginPage } from './components/buckget/LoginPage';
import { KYC } from './components/page/onboarding/KYC';
import { FileUpload } from './components/page/onboarding/FileUpload';
import { 
  authApi, 
  bucketsApi, 
  transactionsApi, 
  setToken, 
  getToken,
  isAuthenticated,
  type User as ApiUser,
  type Bucket as ApiBucket,
  type Transaction as ApiTransaction 
} from './lib/api';
import './styles/globals.css';

// Wallet Context Types
interface Bucket {
  id: string;
  name: string;
  target: number;
  current: number;
  icon: string;
  color: string;
}

interface Transaction {
  id: string;
  type: 'unlock' | 'stash' | 'transfer';
  amount: number;
  date: Date;
  description: string;
}

interface WalletContextType {
  user: { name: string; hourlyRate: number };
  wallet: { currentAvailable: number; totalSaved: number };
  buckets: Bucket[];
  transactions: Transaction[];
  isLoading: boolean;
  updateWallet: (available: number, saved: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateBucket: (id: string, amount: number) => void;
  addBucket: (bucket: Omit<Bucket, 'id'>) => void;
  deleteBucket: (id: string) => void;
  updateBucketDetails: (id: string, updates: Partial<Omit<Bucket, 'id'>>) => void;
  refreshData: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
};

type Page = 'home' | 'transfer' | 'buckets' | 'ai' | 'profile';
type OnboardingStep = 'landing' | 'login' | 'kyc' | 'fileUpload' | 'complete';

// Registration data type
interface RegistrationData {
  full_name: string;
  email: string;
  password: string;
  ic_number?: string;
  phone?: string;
  hourly_rate?: number;
}

export default function App() {
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('landing');
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  // User and wallet state - starts empty, loaded from API
  const [user, setUser] = useState({ name: '', hourlyRate: 0 });
  const [wallet, setWallet] = useState({
    currentAvailable: 0,
    totalSaved: 0,
  });
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Check for existing auth on mount
  useEffect(() => {
    if (getToken()) {
      // User has a token, try to load their data
      loadUserData();
    }
  }, []);

  // Load user data from API
  const loadUserData = async () => {
    if (!isAuthenticated()) return;
    
    setIsLoading(true);
    try {
      // Load user profile
      const userData = await authApi.me();
      setUser({
        name: userData.full_name,
        hourlyRate: userData.hourly_rate,
      });
      setWallet({
        currentAvailable: userData.current_available,
        totalSaved: userData.total_saved,
      });

      // Load buckets
      const bucketsData = await bucketsApi.list();
      setBuckets(bucketsData.map(b => ({
        id: b.id,
        name: b.name,
        target: b.target,
        current: b.current,
        icon: b.icon,
        color: b.color,
      })));

      // Load transactions
      const transactionsData = await transactionsApi.list();
      setTransactions(transactionsData.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        date: new Date(t.created_at),
        description: t.description || '',
      })));

      // Auto-navigate to app if we have valid data
      setOnboardingStep('complete');
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Token might be invalid, clear it
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authApi.login(email, password);
      await loadUserData();
      setOnboardingStep('complete');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (data: { 
    email: string; 
    password: string; 
    full_name: string; 
    hourly_rate?: number;
    ic_number?: string;
    phone?: string;
  }) => {
    setIsLoading(true);
    try {
      await authApi.register(data);
      // Auto-login after registration
      await authApi.login(data.email, data.password);
      await loadUserData();
      setOnboardingStep('complete');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setToken(null);
    setUser({ name: '', hourlyRate: 0 });
    setWallet({ currentAvailable: 0, totalSaved: 0 });
    setBuckets([]);
    setTransactions([]);
    setOnboardingStep('landing');
  };

  const updateWallet = async (available: number, saved: number) => {
    setWallet({ currentAvailable: available, totalSaved: saved });
    // Note: wallet updates happen through transactions API
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const newTx = await transactionsApi.create({
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
      });
      
      setTransactions([
        {
          id: newTx.id,
          type: newTx.type,
          amount: newTx.amount,
          date: new Date(newTx.created_at),
          description: newTx.description || '',
        },
        ...transactions,
      ]);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      // Fallback to local state
      setTransactions([
        { ...transaction, id: Date.now().toString() },
        ...transactions,
      ]);
    }
  };

  const updateBucket = async (id: string, amount: number) => {
    try {
      const bucket = buckets.find(b => b.id === id);
      if (bucket) {
        await bucketsApi.update(id, { current: bucket.current + amount });
      }
      setBuckets(buckets.map(b =>
        b.id === id ? { ...b, current: b.current + amount } : b
      ));
    } catch (error) {
      console.error('Failed to update bucket:', error);
      // Fallback to local state
      setBuckets(buckets.map(b =>
        b.id === id ? { ...b, current: b.current + amount } : b
      ));
    }
  };

  const addBucket = async (bucket: Omit<Bucket, 'id'>) => {
    try {
      const newBucket = await bucketsApi.create({
        name: bucket.name,
        target: bucket.target,
        current: bucket.current,
        icon: bucket.icon,
        color: bucket.color,
      });
      
      setBuckets([
        {
          id: newBucket.id,
          name: newBucket.name,
          target: newBucket.target,
          current: newBucket.current,
          icon: newBucket.icon,
          color: newBucket.color,
        },
        ...buckets,
      ]);
    } catch (error) {
      console.error('Failed to add bucket:', error);
      // Fallback to local state
      setBuckets([
        { ...bucket, id: Date.now().toString() },
        ...buckets,
      ]);
    }
  };

  const deleteBucket = async (id: string) => {
    try {
      await bucketsApi.delete(id);
      setBuckets(buckets.filter(b => b.id !== id));
    } catch (error) {
      console.error('Failed to delete bucket:', error);
      // Fallback to local state
      setBuckets(buckets.filter(b => b.id !== id));
    }
  };

  const updateBucketDetails = async (id: string, updates: Partial<Omit<Bucket, 'id'>>) => {
    try {
      await bucketsApi.update(id, updates);
      setBuckets(buckets.map(b =>
        b.id === id ? { ...b, ...updates } : b
      ));
    } catch (error) {
      console.error('Failed to update bucket details:', error);
      // Fallback to local state
      setBuckets(buckets.map(b =>
        b.id === id ? { ...b, ...updates } : b
      ));
    }
  };

  const refreshData = async () => {
    await loadUserData();
  };

  const walletContextValue: WalletContextType = {
    user,
    wallet,
    buckets,
    transactions,
    isLoading,
    updateWallet,
    addTransaction,
    updateBucket,
    addBucket,
    deleteBucket,
    updateBucketDetails,
    refreshData,
  };

  const navItems = [
    { id: 'home' as Page, icon: Home, label: 'Home' },
    { id: 'transfer' as Page, icon: ArrowLeftRight, label: 'Transfer' },
    { id: 'buckets' as Page, icon: Wallet, label: 'Buckets' },
    { id: 'ai' as Page, icon: Bot, label: 'AI' },
    { id: 'profile' as Page, icon: User, label: 'Profile' },
  ];

  return (
    <WalletContext.Provider value={walletContextValue}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&display=swap');
        `}
      </style>

      {onboardingStep === 'landing' ? (
        <LandingPage
          onGetStarted={() => setOnboardingStep('kyc')}
          onLogin={() => setOnboardingStep('login')}
        />
      ) : onboardingStep === 'login' ? (
        <LoginPage
          onLogin={handleLogin}
          onBack={() => setOnboardingStep('landing')}
        />
      ) : onboardingStep === 'kyc' ? (
        <KYC
          onNext={(data) => {
            setRegistrationData(data);
            setOnboardingStep('fileUpload');
          }}
          onBack={() => setOnboardingStep('landing')}
        />
      ) : onboardingStep === 'fileUpload' ? (
        <FileUpload
          onComplete={async () => {
            if (registrationData) {
              try {
                await handleRegister(registrationData);
              } catch (error) {
                console.error('Registration failed:', error);
                alert('Registration failed. Please try again.');
                setOnboardingStep('kyc');
              }
            } else {
              setOnboardingStep('complete');
            }
          }}
          onBack={() => setOnboardingStep('kyc')}
        />
      ) : onboardingStep === 'complete' ? (
        <div
          className={`relative overflow-x-hidden ${currentPage === 'ai' ? 'bg-gradient-to-b from-[#3930f3] to-[#83d6e2]' : 'bg-[#2820FF]'}`}
          style={{
            minHeight: '100dvh',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
          }}
        >
          <div className={`max-w-md mx-auto relative ${currentPage === 'ai' ? '' : 'pb-32'}`} style={{ minHeight: currentPage === 'ai' ? undefined : '100dvh', height: currentPage === 'ai' ? '100dvh' : undefined }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                className={currentPage === 'ai' ? 'h-full relative' : ''}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
                {currentPage === 'transfer' && <TransferPage onBack={() => setCurrentPage('buckets')} />}
                {currentPage === 'buckets' && <BucketsPage />}
                {currentPage === 'ai' && <AIAgent />}
                {currentPage === 'profile' && <ProfilePage onLogout={handleLogout} />}
              </motion.div>
            </AnimatePresence>

            {/* Floating Pill Navigation */}
            <motion.nav
              className="fixed left-1/2 -translate-x-1/2 z-50"
              style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="bg-white/20 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;

                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => setCurrentPage(item.id)}
                        className={`relative px-4 py-2 rounded-full transition-all ${isActive
                          ? 'bg-[#FEFF09] text-[#0F172A]'
                          : 'text-white hover:bg-white/10'
                          }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.nav>
          </div>
        </div>
      ) : null}
    </WalletContext.Provider>
  );
}
