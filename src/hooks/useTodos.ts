import { useState } from 'react';
import { Todo, ValidationResult } from './types';
import { validateInput, createTodo } from '../utils/todoUtils';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (inputValue: string): ValidationResult => {
    const validation = validateInput(inputValue);

    if (!validation.isValid) {
      return validation;
    }

    const newTodo = createTodo(inputValue, todos);
    setTodos([...todos, newTodo]);
    return { isValid: true, errorMessage: '' };
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    );
  };

  const deleteTodo = (id: number): boolean => {
    const todoToDelete = todos.find((todo) => todo.id === id);

    if (todoToDelete?.completed) {
      if (window.confirm('완료된 할일을 삭제하시겠습니까?')) {
        setTodos(todos.filter((todo) => todo.id !== id));
        return true;
      }
      return false;
    } else {
      setTodos(todos.filter((todo) => todo.id !== id));
      return true;
    }
  };

  return {
    todos,
    setTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
};
