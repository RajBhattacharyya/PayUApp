export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', icon: 'restaurant-outline', color: '#FF9F43', type: 'expense' },
  { id: 'travel', name: 'Travel', icon: 'airplane-outline', color: '#54A0FF', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: 'bag-handle-outline', color: '#FF6B81', type: 'expense' },
  { id: 'health', name: 'Health', icon: 'medkit-outline', color: '#00D2D3', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film-outline', color: '#A29BFE', type: 'expense' },
  { id: 'utilities', name: 'Utilities', icon: 'flash-outline', color: '#FD79A8', type: 'expense' },
  { id: 'education', name: 'Education', icon: 'school-outline', color: '#6C5CE7', type: 'expense' },
  { id: 'rent', name: 'Rent', icon: 'home-outline', color: '#E17055', type: 'expense' },
  { id: 'salary', name: 'Salary', icon: 'cash-outline', color: '#00B894', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: 'laptop-outline', color: '#0984E3', type: 'income' },
  { id: 'investment', name: 'Investment', icon: 'trending-up-outline', color: '#00CEC9', type: 'income' },
  { id: 'gift', name: 'Gift', icon: 'gift-outline', color: '#FDCB6E', type: 'both' },
  { id: 'other', name: 'Other', icon: 'apps-outline', color: '#636E72', type: 'both' },
];

export const getCategoryById = (id: string): Category =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];