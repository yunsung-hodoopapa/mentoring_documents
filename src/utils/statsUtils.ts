import { Todo, TodoStats } from '../hooks/types';

/**
 * 순수 함수: 할일 목록의 통계를 계산합니다
 */
export const calculateTodoStats = (todos: Todo[]): TodoStats => {
  const total = todos.length;
  const completed = todos.filter((todo) => todo.completed).length;
  const pending = total - completed;

  return { total, completed, pending };
};

/**
 * 순수 함수: 우선순위별 통계를 계산합니다
 */
export const calculatePriorityStats = (todos: Todo[]) => {
  const high = todos.filter((todo) => todo.priority === 'high').length;
  const medium = todos.filter((todo) => todo.priority === 'medium').length;
  const low = todos.filter((todo) => todo.priority === 'low').length;

  return { high, medium, low };
};

/**
 * 순수 함수: 완료율을 계산합니다 (퍼센트)
 */
export const calculateCompletionRate = (todos: Todo[]): number => {
  if (todos.length === 0) return 0;
  const completed = todos.filter((todo) => todo.completed).length;
  return Math.round((completed / todos.length) * 100);
};
