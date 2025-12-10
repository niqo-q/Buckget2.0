import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowDownLeft, ArrowUpRight, Repeat, Filter, Calendar, DollarSign } from 'lucide-react';
import { useWallet } from '../../App';

type FilterType = 'all' | 'unlock' | 'stash' | 'transfer';

export function TransactionsPage() {
  const { transactions, wallet } = useWallet();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);

  const filteredTransactions = transactions.filter(t => 
    filter === 'all' || t.type === filter
  );

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'unlock':
        return <ArrowDownLeft className="w-5 h-5" />;
      case 'stash':
        return <ArrowUpRight className="w-5 h-5" />;
      case 'transfer':
        return <Repeat className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'unlock':
        return 'bg-[#10B981] text-white';
      case 'stash':
        return 'bg-[#FF44EC] text-white';
      case 'transfer':
        return 'bg-[#F97316] text-white';
      default:
        return 'bg-white/20 text-white';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'unlock', label: 'Unlocks' },
    { value: 'stash', label: 'Saves' },
    { value: 'transfer', label: 'Transfers' },
  ];

  // Calculate totals
  const totalUnlocked = transactions
    .filter(t => t.type === 'unlock')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSaved = transactions
    .filter(t => t.type === 'stash')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen p-6 text-white">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-4xl mb-2"
          style={{ fontFamily: '"Momo Trust Display", sans-serif', fontWeight: 800 }}
        >
          Transactions
        </h1>
        <p className="text-white/70" style={{ fontFamily: 'Inter, sans-serif' }}>
          Your financial activity
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-2 gap-4 mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-[#10B981] rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownLeft className="w-4 h-4" />
            <span className="text-xs text-white/80">Total Unlocked</span>
          </div>
          <p
            className="text-2xl"
            style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}
          >
            ${totalUnlocked.toFixed(2)}
          </p>
        </div>
        <div className="bg-[#FF44EC] rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-xs text-white/80">Total Saved</span>
          </div>
          <p
            className="text-2xl"
            style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}
          >
            ${totalSaved.toFixed(2)}
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                filter === f.value
                  ? 'bg-[#FEFF09] text-[#0F172A]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        className="space-y-3 mb-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <p className="text-white/50" style={{ fontFamily: 'Inter, sans-serif' }}>
              No transactions yet
            </p>
          </div>
        ) : (
          filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              className="bg-white rounded-2xl p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => setSelectedTransaction(
                selectedTransaction === transaction.id ? null : transaction.id
              )}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="flex-1">
                  <p
                    className="text-[#0F172A] capitalize"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                  >
                    {transaction.type === 'unlock' ? 'Wage Unlock' : 
                     transaction.type === 'stash' ? 'Auto Save' : 
                     'Transfer'}
                  </p>
                  <p className="text-sm text-[#0F172A]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {transaction.description || formatDate(transaction.date)}
                  </p>
                </div>
                <p
                  className={`text-xl ${
                    transaction.type === 'unlock' ? 'text-[#10B981]' : 
                    transaction.type === 'stash' ? 'text-[#FF44EC]' : 
                    'text-[#0F172A]'
                  }`}
                  style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}
                >
                  {transaction.type === 'unlock' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </p>
              </div>

              {/* Expanded Details */}
              {selectedTransaction === transaction.id && (
                <motion.div
                  className="mt-4 pt-4 border-t border-[#0F172A]/10"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#0F172A]/50">Type</p>
                      <p className="text-[#0F172A] capitalize">{transaction.type}</p>
                    </div>
                    <div>
                      <p className="text-[#0F172A]/50">Date</p>
                      <p className="text-[#0F172A]">{formatDate(transaction.date)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[#0F172A]/50">Transaction ID</p>
                      <p className="text-[#0F172A] text-xs font-mono">{transaction.id}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}

