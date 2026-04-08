export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', icon: '🍔', color: '#FF9F43', type: 'expense' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#54A0FF', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#FF6B81', type: 'expense' },
  { id: 'health', name: 'Health', icon: '💊', color: '#00D2D3', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#A29BFE', type: 'expense' },
  { id: 'utilities', name: 'Utilities', icon: '⚡', color: '#FD79A8', type: 'expense' },
  { id: 'education', name: 'Education', icon: '📚', color: '#6C5CE7', type: 'expense' },
  { id: 'rent', name: 'Rent', icon: '🏠', color: '#E17055', type: 'expense' },
  { id: 'salary', name: 'Salary', icon: '💼', color: '#00B894', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#0984E3', type: 'income' },
  { id: 'investment', name: 'Investment', icon: '📈', color: '#00CEC9', type: 'income' },
  { id: 'gift', name: 'Gift', icon: '🎁', color: '#FDCB6E', type: 'both' },
  { id: 'other', name: 'Other', icon: '📦', color: '#636E72', type: 'both' },
];

export const getCategoryById = (id: string): Category =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];