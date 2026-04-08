import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  Transaction,
  User,
  saveTransactions,
  loadTransactions,
  saveUser,
  loadUser,
} from '../utils/storage';
import { getMonthKey, getCurrentMonthKey } from '../utils/formatters';

interface MonthSummary {
  income: number;
  expenses: number;
  balance: number;
  byCategory: Record<string, number>;
}

interface TransactionContextType {
  transactions: Transaction[];
  user: User;
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateUser: (u: Partial<User>) => Promise<void>;
  getMonthlySummary: (monthKey?: string) => MonthSummary;
  getFilteredTransactions: (monthKey?: string) => Transaction[];
  isLoading: boolean;
}

const defaultUser: User = {
  name: 'Alex Yu',
  email: 'alex@gmail.com',
  balance: 20000,
  totalIncome: 24000,
  totalExpenses: 4000,
};

const TransactionContext = createContext<TransactionContextType>({} as TransactionContextType);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<User>(defaultUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const [txns, usr] = await Promise.all([loadTransactions(), loadUser()]);
      setTransactions(txns);
      if (usr) setUser(usr);
      setIsLoading(false);
    };
    init();
  }, []);

  const addTransaction = useCallback(
    async (t: Omit<Transaction, 'id' | 'createdAt'>) => {
      const newTxn: Transaction = {
        ...t,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updated = [newTxn, ...transactions];
      setTransactions(updated);
      await saveTransactions(updated);

      // Update user balance
      const balanceDelta = t.type === 'income' ? t.amount : -t.amount;
      const updatedUser: User = {
        ...user,
        balance: user.balance + balanceDelta,
        totalIncome: t.type === 'income' ? user.totalIncome + t.amount : user.totalIncome,
        totalExpenses: t.type === 'expense' ? user.totalExpenses + t.amount : user.totalExpenses,
      };
      setUser(updatedUser);
      await saveUser(updatedUser);
    },
    [transactions, user]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const txn = transactions.find((t) => t.id === id);
      if (!txn) return;
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);
      await saveTransactions(updated);

      const balanceDelta = txn.type === 'income' ? -txn.amount : txn.amount;
      const updatedUser: User = {
        ...user,
        balance: user.balance + balanceDelta,
        totalIncome: txn.type === 'income' ? user.totalIncome - txn.amount : user.totalIncome,
        totalExpenses:
          txn.type === 'expense' ? user.totalExpenses - txn.amount : user.totalExpenses,
      };
      setUser(updatedUser);
      await saveUser(updatedUser);
    },
    [transactions, user]
  );

  const updateUser = useCallback(
    async (u: Partial<User>) => {
      const updated = { ...user, ...u };
      setUser(updated);
      await saveUser(updated);
    },
    [user]
  );

  const getFilteredTransactions = useCallback(
    (monthKey?: string) => {
      const key = monthKey || getCurrentMonthKey();
      return transactions.filter((t) => getMonthKey(t.date) === key);
    },
    [transactions]
  );

  const getMonthlySummary = useCallback(
    (monthKey?: string): MonthSummary => {
      const filtered = getFilteredTransactions(monthKey);
      const income = filtered
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);
      const expenses = filtered
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);
      const byCategory: Record<string, number> = {};
      filtered
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
          byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
        });
      return { income, expenses, balance: income - expenses, byCategory };
    },
    [getFilteredTransactions]
  );

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        user,
        addTransaction,
        deleteTransaction,
        updateUser,
        getMonthlySummary,
        getFilteredTransactions,
        isLoading,
      }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);