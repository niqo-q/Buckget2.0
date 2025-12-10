import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onBack: () => void;
}

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2820FF]">
      <div className="max-w-md mx-auto p-6">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-6"
          style={{ fontFamily: 'Inter, sans-serif' }}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>

        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1
            className="text-5xl text-white mb-3"
            style={{ fontFamily: '"Momo Trust Display", sans-serif', fontWeight: 800 }}
          >
            WELCOME BACK
          </h1>
          <p className="text-white/70" style={{ fontFamily: 'Inter, sans-serif' }}>
            Sign in to continue to BuckGet
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {error && (
            <motion.div
              className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-red-300 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                {error}
              </p>
            </motion.div>
          )}

          <div>
            <label
              className="block text-sm text-white/70 mb-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2820FF]/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-[2.5rem] focus:outline-none focus:border-[#FEFF09] text-[#0F172A]"
                style={{ fontFamily: 'Inter, sans-serif' }}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label
              className="block text-sm text-white/70 mb-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2820FF]/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white border-2 border-transparent rounded-[2.5rem] focus:outline-none focus:border-[#FEFF09] text-[#0F172A]"
                style={{ fontFamily: 'Inter, sans-serif' }}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2820FF]/50 hover:text-[#2820FF]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FEFF09] text-[#0F172A] py-5 rounded-full flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: '"Momo Trust Display", sans-serif', fontWeight: 800 }}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                SIGNING IN...
              </>
            ) : (
              'SIGN IN'
            )}
          </motion.button>
        </motion.form>

        <motion.p
          className="text-center text-white/50 mt-8"
          style={{ fontFamily: 'Inter, sans-serif' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Don't have an account?{' '}
          <button
            onClick={onBack}
            className="text-[#FEFF09] hover:underline"
          >
            Sign up
          </button>
        </motion.p>
      </div>
    </div>
  );
}

