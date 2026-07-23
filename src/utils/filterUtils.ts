import { Todo, FilterType } from '../hooks/types';

/**
 * 순수 함수: 필터 타입에 따라 할일을 필터링합니다
 */
export const filterTodos = (todos: Todo[], filter: FilterType): Todo[] => {
  switch (filter) {
    case 'completed':
      return todos.filter((todo) => todo.completed);
    case 'pending':
      return todos.filter((todo) => !todo.completed);
    case 'all':
    default:
      return todos;
  }
};

/**
 * 순수 함수: 우선순위와 생성일 기준으로 할일을 정렬합니다
 */
export const sortTodos = (todos: Todo[]): Todo[] => {
  return [...todos].sort((a, b) => {
    // 우선순위별 정렬
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    if (a.priority === 'medium' && b.priority === 'low') return -1;
    if (a.priority === 'low' && b.priority === 'medium') return 1;

    // 같은 우선순위면 생성일 기준 내림차순
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

/**
 * 순수 함수: 필터링과 정렬을 한 번에 수행합니다
 */
export const getFilteredAndSortedTodos = (todos: Todo[], filter: FilterType): Todo[] => {
  const filtered = filterTodos(todos, filter);
  return sortTodos(filtered);
};
