import { Todo } from './types';
import { useLocalStorage } from './useLocalStorage';

/**
 * Todo 특화 localStorage 훅
 * Todo 객체의 createdAt Date 변환을 자동으로 처리
 */
export const useTodoStorage = (todos: Todo[], setTodos: (todos: Todo[]) => void) => {
  return useLocalStorage('todos', todos, setTodos, {
    parser: (todo: unknown): Todo => {
      const todoData = todo as Omit<Todo, 'createdAt'> & { createdAt: string };
      return {
        ...todoData,
        createdAt: new Date(todoData.createdAt),
      };
    },
  });
};
