export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

export type FilterType = 'all' | 'pending' | 'completed';

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage: string;
}
