import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Bed,
  Bus,
  Utensils,
  Ticket,
  ShoppingBag,
} from 'lucide-react';
import { Button } from './Button';

export type ExpenseCategory = 'stay' | 'travel' | 'food' | 'activities' | 'other';

export interface ExpenseItem {
  id: string;
  category: ExpenseCategory;
  note: string;
  amount: number;
  date: string;
}

interface KharchaTrackerProps {
  tripId: string;
  allocatedBudget?: number;
  categoryBudgets?: {
    stay?: number;
    travel?: number;
    food?: number;
    activities?: number;
    other?: number;
  };
}

const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  stay: { label: 'Stay & Hotels', icon: Bed, color: '#0071e3' },
  travel: { label: 'Travel & Transit', icon: Bus, color: '#ff6b35' },
  food: { label: 'Food & Dining', icon: Utensils, color: '#34c759' },
  activities: { label: 'Activities & Entry', icon: Ticket, color: '#af52de' },
  other: { label: 'Shopping & Misc', icon: ShoppingBag, color: '#86868b' },
};

export const KharchaTracker: React.FC<KharchaTrackerProps> = ({
  tripId,
  allocatedBudget = 15000,
  categoryBudgets,
}) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    try {
      const stored = localStorage.getItem(`safar_expenses_${tripId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`safar_expenses_${tripId}`, JSON.stringify(expenses));
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
  }, [tripId, expenses]);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [expenses]);

  const remainingBudget = allocatedBudget - totalSpent;
  const isOverBudget = remainingBudget < 0;
  const spentPercent = Math.min(100, Math.round((totalSpent / Math.max(1, allocatedBudget)) * 100));

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newItem: ExpenseItem = {
      id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      category,
      note: note.trim() || CATEGORY_META[category].label,
      amount: parsedAmount,
      date: new Date().toISOString(),
    };

    setExpenses((prev) => [newItem, ...prev]);
    setNote('');
    setAmount('');
    setShowAddForm(false);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-white dark:bg-[#1d1d1f] rounded-2xl p-6 border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e8ed] dark:border-[#333336]">
        <div>
          <h3 className="text-[20px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#ff6b35]" />
            <span>Kharcha Tracker (Live Expenses)</span>
          </h3>
          <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-0.5">
            Log your real-time on-trip spends — keeps you within budget
          </p>
        </div>

        <Button
          variant={showAddForm ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Cancel' : 'Add Expense'}</span>
        </Button>
      </div>

      {/* Budget Meter Bar */}
      <div className="p-4 rounded-xl bg-[#fafafa] dark:bg-[#252528] border border-[#e8e8ed] dark:border-[#38383a] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 text-[13px]">
          <div className="flex items-center gap-2">
            <span className="text-[#86868b] dark:text-[#a1a1a6]">Spent:</span>
            <span className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] text-[15px] tabular-nums">
              ₹{totalSpent.toLocaleString('en-IN')}
            </span>
            <span className="text-[#86868b] dark:text-[#a1a1a6] text-[12px]">
              of ₹{allocatedBudget.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isOverBudget ? (
              <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold text-[12px] bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900/60">
                <AlertCircle className="w-3 h-3" />
                <span>Over budget by ₹{Math.abs(remainingBudget).toLocaleString('en-IN')}</span>
              </span>
            ) : (
              <span className="text-emerald-700 dark:text-emerald-400 font-medium text-[12px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>₹{remainingBudget.toLocaleString('en-IN')} left</span>
              </span>
            )}
          </div>
        </div>

        {/* Apple-style Progress Bar */}
        <div className="w-full h-2.5 bg-[#e8e8ed] dark:bg-[#333336] rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-all duration-300 origin-left ${
              isOverBudget ? 'bg-red-500' : 'bg-gradient-to-r from-[#ff6b35] to-[#34c759]'
            }`}
            style={{ width: `${spentPercent}%` }}
          />
        </div>
      </div>

      {/* Add Expense Inline Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleAddExpense}
            className="overflow-hidden p-4 rounded-xl bg-[#f5f5f7] dark:bg-[#202023] border border-[#e8e8ed] dark:border-[#333336] space-y-4"
          >
            <div className="font-semibold text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]">
              New Expense Entry
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(CATEGORY_META) as ExpenseCategory[]).map((catKey) => {
                const isSelected = category === catKey;
                const Icon = CATEGORY_META[catKey].icon;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#ff6b35] text-white'
                        : 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-[#e8e8ed] dark:border-[#38383a]'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{CATEGORY_META[catKey].label}</span>
                  </button>
                );
              })}
            </div>

            {/* Note & Amount Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Note (e.g. Dinner, Cab ride, Souvenirs)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-[14px] bg-white dark:bg-[#1d1d1f] border border-[#d2d2d7] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:border-[#ff6b35]"
                />
              </div>

              <div>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-[#86868b] dark:text-[#a1a1a6] text-[14px]">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="1"
                    className="w-full pl-7 pr-3.5 py-2 rounded-xl text-[14px] bg-white dark:bg-[#1d1d1f] border border-[#d2d2d7] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:border-[#ff6b35]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="submit" variant="primary" size="sm">
                <span>Save Expense</span>
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Expenses History List */}
      <div className="space-y-2">
        <div className="text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6]">
          Logged Spends ({expenses.length})
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-6 text-[13px] text-[#86868b] dark:text-[#a1a1a6] bg-[#fafafa] dark:bg-[#202022] rounded-xl border border-dashed border-[#e8e8ed] dark:border-[#333336]">
            No expenses logged yet. Tap "+ Add Expense" above as you spend during your trip!
          </div>
        ) : (
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {expenses.map((item) => {
              const meta = CATEGORY_META[item.category] || CATEGORY_META.other;
              const Icon = meta.icon;
              const dateFormatted = new Date(item.date).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#fafafa] dark:bg-[#222225] border border-[#e8e8ed] dark:border-[#333336] text-[13px]"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${meta.color}15`,
                        color: meta.color,
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div>
                      <div className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {item.note}
                      </div>
                      <div className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] flex items-center gap-1">
                        <span>{meta.label}</span>
                        <span>•</span>
                        <span>{dateFormatted}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tabular-nums">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(item.id)}
                      aria-label="Delete expense"
                      className="w-6 h-6 rounded-full text-[#86868b] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
