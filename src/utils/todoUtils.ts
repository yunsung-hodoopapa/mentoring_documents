import { Todo, ValidationResult } from '../hooks/types';

/**
 * 순수 함수: 새로운 할일의 ID를 생성합니다
 */
export const generateTodoId = (existingTodos: Todo[]): number => {
  if (existingTodos.length === 0) return 1;
  return Math.max(...existingTodos.map((t) => t.id)) + 1;
};

/**
 * 순수 함수: 텍스트 내용을 기반으로 우선순위를 결정합니다
 */
export const determinePriority = (text: string): 'high' | 'medium' | 'low' => {
  if (text.includes('!')) return 'high';
  if (text.includes('?')) return 'medium';
  return 'low';
};

/**
 * 순수 함수: 입력값을 검증합니다
 */
export const validateInput = (value: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, errorMessage: '할일을 입력해주세요!' };
  }
  if (value.length > 100) {
    return { isValid: false, errorMessage: '할일은 100자 이하로 입력해주세요!' };
  }
  return { isValid: true, errorMessage: '' };
};

/**
 * 순수 함수: 새로운 할일 객체를 생성합니다
 */
export const createTodo = (inputValue: string, existingTodos: Todo[]): Todo => {
  return {
    id: generateTodoId(existingTodos),
    text: inputValue.trim(),
    completed: false,
    priority: determinePriority(inputValue),
    createdAt: new Date(),
  };
};
