import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TRANSACTIONS: 'payu_transactions',
  USER: 'payu_user',
  AUTH: 'payu_auth',
  THEME: 'payu_theme',
};

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note: string;
  createdAt: string;
}

export interface User {
  name: string;
  email: string;
  balance: number;
  totalIncome: number;
  totalExpenses: number;
}

// Transactions
export const saveTransactions = async (transactions: Transaction[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const loadTransactions = async (): Promise<Transaction[]> => {
  const raw = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
  return raw ? JSON.parse(raw) : [];
};

// User
export const saveUser = async (user: User): Promise<void> => {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const loadUser = async (): Promise<User | null> => {
  const raw = await AsyncStorage.getItem(KEYS.USER);
  return raw ? JSON.parse(raw) : null;
};

// Auth
export const setAuthenticated = async (val: boolean): Promise<void> => {
  await AsyncStorage.setItem(KEYS.AUTH, JSON.stringify(val));
};

export const isAuthenticated = async (): Promise<boolean> => {
  const raw = await AsyncStorage.getItem(KEYS.AUTH);
  return raw ? JSON.parse(raw) : false;
};

export const clearAll = async (): Promise<void> => {
  await AsyncStorage.multiRemove(Object.values(KEYS));
};

// Theme
export const saveTheme = async (isDark: boolean): Promise<void> => {
  await AsyncStorage.setItem(KEYS.THEME, JSON.stringify(isDark));
};

export const loadTheme = async (): Promise<boolean> => {
  const raw = await AsyncStorage.getItem(KEYS.THEME);
  return raw !== null ? JSON.parse(raw) : true;
};