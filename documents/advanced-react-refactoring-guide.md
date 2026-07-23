# 고급 React 리팩토링 가이드: 함수형 프로그래밍에서 아키텍처 설계까지

## 📋 개요

이 가이드는 **React 컴포넌트를 함수형 프로그래밍 원칙에 따라 리팩토링하고, 더 나아가 확장 가능한 아키텍처로 발전시키는 과정**을 다룹니다.

**대상**: React 기초를 익힌 중급 개발자  
**목표**: 유지보수 가능하고 확장 가능한 React 애플리케이션 아키텍처 설계

## 🎯 학습 목표

1. **함수형 프로그래밍 원칙** 적용하기
2. **커스텀 훅으로 비즈니스 로직 분리**하기
3. **Utils, Services, Hooks의 역할** 이해하기
4. **과도한 추상화 피하기** (YAGNI 원칙)
5. **확장 가능한 아키텍처** 설계하기

---

## 🚨 1단계: 함수형 프로그래밍 기본 원칙 적용

### 문제가 있던 코드 패턴들

#### ❌ 전역 변수 사용

```tsx
let todoId = 0; // 전역 변수

const generateId = () => {
  todoId += 1; // 부수 효과 발생
  return todoId;
};
```

#### ❌ 배열/객체 직접 수정 (불변성 위반)

```tsx
const addTodo = () => {
  const newTodo = {
    /* ... */
  };
  todos.push(newTodo); // ❌ 배열 직접 수정
  setTodos(todos); // 같은 참조로 상태 업데이트
};

const toggleTodo = (todo: Todo) => {
  todo.completed = !todo.completed; // ❌ 객체 직접 수정
  setTodos([...todos]);
};
```

#### ❌ 과도한 useEffect 사용

```tsx
useEffect(() => {
  console.log('할일이 변경되었습니다:', todos);
}, [todos]);

useEffect(() => {
  document.title = `할일 ${todos.length}개`;
}, [todos]);
```

### ✅ 개선된 코드

#### ✅ 순수 함수로 ID 생성

```tsx
const generateTodoId = (existingTodos: Todo[]): number => {
  if (existingTodos.length === 0) return 1;
  return Math.max(...existingTodos.map((t) => t.id)) + 1;
};
```

#### ✅ 불변성을 지키는 상태 업데이트

```tsx
const addTodo = () => {
  const newTodo = createTodo(inputValue, todos);
  setTodos([...todos, newTodo]); // ✅ 새로운 배열 생성
};

const toggleTodo = (id: number) => {
  setTodos(
    todos.map((todo) =>
      todo.id === id
        ? { ...todo, completed: !todo.completed } // ✅ 새 객체 생성
        : todo,
    ),
  );
};
```

#### ✅ useEffect 통합 및 최적화

```tsx
useEffect(() => {
  document.title = `할일 ${todos.length}개`;
  console.log('할일이 변경되었습니다:', todos);
}, [todos]);
```

---

## 🔧 2단계: 커스텀 훅으로 비즈니스 로직 분리

### 문제점: 컴포넌트에 모든 로직이 섞여있음

```tsx
const TodoList = () => {
  // 상태 관리
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all');

  // 비즈니스 로직
  const addTodo = () => {
    /* ... */
  };
  const toggleTodo = () => {
    /* ... */
  };
  const deleteTodo = () => {
    /* ... */
  };

  // 부수 효과
  useEffect(() => {
    /* localStorage 로직 */
  }, []);
  useEffect(() => {
    /* 알림 로직 */
  }, []);

  // 계산 로직
  const filteredTodos = useMemo(() => {
    /* ... */
  }, []);

  // 렌더링 로직
  return <div>{/* 복잡한 JSX */}</div>;
};
```

### ✅ 개선: 관심사별로 커스텀 훅 분리

#### 1. 핵심 상태 관리 훅

```tsx
// hooks/useTodos.ts
export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (inputValue: string): ValidationResult => {
    const validation = validateInput(inputValue);
    if (!validation.isValid) return validation;

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
    // 삭제 로직...
    return true;
  };

  return { todos, setTodos, addTodo, toggleTodo, deleteTodo };
};
```

#### 2. 알림 관리 훅

```tsx
// hooks/useNotification.ts
export const useNotification = () => {
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string) => setNotification(message);
  const showError = (message: string) => setError(message);

  return { notification, error, showNotification, showError };
};
```

#### 3. 깔끔해진 컴포넌트

```tsx
const TodoList: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  // 커스텀 훅들로 관심사 분리
  const { todos, setTodos, addTodo, toggleTodo, deleteTodo } = useTodos();
  const { isLoading } = useTodoStorage(todos, setTodos);
  const { notification, showNotification, showError } = useNotification();

  // 계산 로직은 utils 사용
  const filteredTodos = useMemo(() => getFilteredAndSortedTodos(todos, filter), [todos, filter]);

  // 컴포넌트는 UI 렌더링에만 집중
  return <div>{/* 간결한 JSX */}</div>;
};
```

---

## 🏗️ 3단계: 아키텍처 레이어 분리

### 초기 구조의 문제점

```
src/hooks/
├── useTodos.ts          # 상태 + 비즈니스 로직
├── useTodoFilter.ts     # 단순 계산인데 훅 사용 ❌
├── useTodoStats.ts      # 단순 계산인데 훅 사용 ❌
└── useLocalStorage.ts   # Todo에 특화된 로직 ❌
```

### ✅ 개선된 아키텍처

```
src/
├── lib/              # 범용 라이브러리 (다른 프로젝트에서도 사용 가능)
│   └── storage.ts        # 제네릭 localStorage 유틸리티
├── utils/            # 프로젝트 특화 순수 함수들
│   ├── todoUtils.ts      # Todo 생성, 검증, ID 생성
│   ├── filterUtils.ts    # 필터링, 정렬 로직
│   └── statsUtils.ts     # 통계 계산
└── hooks/            # React 상태 관리만
    ├── useTodos.ts       # Todo 상태 관리
    ├── useTodoStorage.ts # Todo 특화 localStorage
    ├── useLocalStorage.ts # 범용 localStorage 훅
    └── useNotification.ts # 알림 상태 관리
```

#### 각 레이어의 역할

##### 📚 **lib/** - 범용 라이브러리

```tsx
// lib/storage.ts - 어떤 프로젝트에서든 사용 가능
export const loadArrayFromStorage = <T>(
  key: string,
  options: StorageOptions<T> = {}
): T[] => {
  // 제네릭으로 모든 타입 지원
};

export const saveArrayToStorage = <T>(
  key: string,
  data: T[],
  options: StorageOptions<T> = {}
): void => {
  // 범용 저장 함수
};
```

##### 🔧 **utils/** - 순수 함수들

```tsx
// utils/filterUtils.ts - 테스트하기 쉬운 순수 함수
export const filterTodos = (todos: Todo[], filter: FilterType): Todo[] => {
  switch (filter) {
    case 'completed':
      return todos.filter((todo) => todo.completed);
    case 'pending':
      return todos.filter((todo) => !todo.completed);
    default:
      return todos;
  }
};

export const sortTodos = (todos: Todo[]): Todo[] => {
  return [...todos].sort((a, b) => {
    // 우선순위별 정렬 로직
  });
};
```

##### ⚛️ **hooks/** - React 상태 관리

```tsx
// hooks/useLocalStorage.ts - 범용 훅
export const useLocalStorage = <T>(
  key: string,
  data: T[],
  setData: (data: T[]) => void,
  options: UseLocalStorageOptions<T> = {}
) => {
  // 어떤 타입의 데이터든 localStorage와 동기화
};

// hooks/useTodoStorage.ts - Todo 특화 훅
export const useTodoStorage = (todos: Todo[], setTodos: (todos: Todo[]) => void) => {
  return useLocalStorage('todos', todos, setTodos, {
    parser: (todo: unknown): Todo => ({
      ...todo as any,
      createdAt: new Date((todo as any).createdAt),
    }),
  });
};
```

---

## ⚠️ 4단계: 과도한 추상화 피하기 (YAGNI 원칙)

### 문제: 불필요한 래핑 레이어

```tsx
// ❌ todoStorageUtils.ts - 불필요한 추상화
export const loadTodosFromStorage = (): Todo[] => {
  return loadArrayFromStorage<Todo>(TODOS_STORAGE_KEY, {
    parser: parseTodo,
  });
};

export const saveTodosToStorage = (todos: Todo[]): void => {
  saveArrayToStorage(TODOS_STORAGE_KEY, todos);
};
```

**문제점:**

- 단순한 함수 래핑만 하고 있음
- 실질적인 가치 제공하지 못함
- 불필요한 파일과 복잡성 증가

### ✅ 개선: 직접 사용

```tsx
// ✅ useTodoStorage.ts에서 직접 처리
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
```

**개선점:**

- 불필요한 중간 레이어 제거
- 로직이 사용되는 곳에서 명확히 보임
- 파일 수 감소, 복잡성 감소

---

## 📊 성능 최적화

### useMemo를 활용한 계산 최적화

```tsx
const TodoList = () => {
  const { todos } = useTodos();
  const [filter, setFilter] = useState<FilterType>('all');

  // ✅ 필터링과 정렬을 메모이제이션
  const filteredAndSortedTodos = useMemo(
    () => getFilteredAndSortedTodos(todos, filter),
    [todos, filter], // 의존성이 변경될 때만 재계산
  );

  // ✅ 통계 계산도 메모이제이션
  const stats = useMemo(() => calculateTodoStats(todos), [todos]);

  return (
    <div>
      <div>
        통계: {stats.total}개 중 {stats.completed}개 완료
      </div>
      {filteredAndSortedTodos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
};
```

---

## 🧪 테스트 용이성

### 레이어별 테스트 전략

#### 1. Utils 테스트 (가장 쉬움)

```tsx
// utils/filterUtils.test.ts
describe('filterTodos', () => {
  it('should filter completed todos', () => {
    const todos = [
      { id: 1, text: 'Task 1', completed: true },
      { id: 2, text: 'Task 2', completed: false },
    ];

    const result = filterTodos(todos, 'completed');
    expect(result).toHaveLength(1);
    expect(result[0].completed).toBe(true);
  });
});
```

#### 2. Hooks 테스트

```tsx
// hooks/useTodos.test.ts
import { renderHook, act } from '@testing-library/react';
import { useTodos } from './useTodos';

describe('useTodos', () => {
  it('should add todo correctly', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('New task');
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('New task');
  });
});
```

#### 3. 컴포넌트 테스트

```tsx
// components/TodoList.test.tsx
import { render, screen } from '@testing-library/react';
import { TodoList } from './TodoList';

// 훅들을 모킹하여 컴포넌트 로직만 테스트
jest.mock('../hooks/useTodos');
jest.mock('../hooks/useNotification');

describe('TodoList', () => {
  it('should render todos correctly', () => {
    // 모킹된 데이터로 렌더링 테스트
  });
});
```

---

## 🎯 최종 아키텍처의 장점

### 1. **관심사 분리** 🎯

- **lib**: 범용 라이브러리
- **utils**: 순수 함수, 비즈니스 로직
- **hooks**: React 상태 관리
- **components**: UI 렌더링

### 2. **재사용성** ♻️

- `lib/storage.ts`: 다른 프로젝트에서도 사용 가능
- `utils/*`: 다른 컴포넌트에서 재사용 가능
- `hooks/*`: 조합 가능한 작은 단위들

### 3. **테스트 용이성** 🧪

- Utils: 순수 함수라서 단위 테스트 매우 쉬움
- Hooks: React Testing Library로 독립 테스트
- Components: 훅을 모킹하여 UI 로직만 테스트

### 4. **유지보수성** 🔧

- 기능별로 코드가 분리되어 수정이 쉬움
- 버그 발생 시 해당 레이어만 수정
- 새로운 기능 추가 시 적절한 레이어에 배치

### 5. **확장성** 🚀

- 새로운 필터나 통계가 필요하면 utils에만 함수 추가
- 새로운 데이터 타입이 필요하면 lib의 제네릭 활용
- 새로운 상태가 필요하면 새로운 훅 생성

---

## 📝 체크리스트

리팩토링 완료 후 다음 사항들을 확인해보세요:

### ✅ 함수형 프로그래밍 원칙

- [ ] 전역 변수 사용하지 않음
- [ ] 배열이나 객체를 직접 수정하지 않음
- [ ] 함수들이 예측 가능한 결과를 반환함
- [ ] 부수 효과가 명확히 분리됨

### ✅ 아키텍처 분리

- [ ] lib: 범용 라이브러리
- [ ] utils: 순수 함수들
- [ ] hooks: React 상태 관리만
- [ ] components: UI 렌더링에만 집중

### ✅ 성능 최적화

- [ ] 계산 로직에 useMemo 적용
- [ ] 불필요한 리렌더링 방지
- [ ] useEffect 최적화

### ✅ 코드 품질

- [ ] 각 함수/훅의 단일 책임 원칙 준수
- [ ] 과도한 추상화 피함 (YAGNI)
- [ ] 타입 안전성 확보
- [ ] 테스트 작성 용이함

---

## 🚀 다음 단계

이 기본기를 익혔다면, 다음을 도전해보세요:

1. **상태 관리 라이브러리**: Zustand, Redux Toolkit 도입
2. **에러 바운더리**: 에러 처리 개선
3. **React Query**: 서버 상태 관리
4. **컴포넌트 합성**: Compound Components 패턴
5. **성능 최적화**: React.memo, useCallback 활용

---

## 💡 핵심 원칙 요약

1. **단순함이 복잡함보다 낫다**
2. **필요한 만큼만 추상화하라** (YAGNI)
3. **관심사를 명확히 분리하라**
4. **순수 함수를 선호하라**
5. **테스트하기 쉬운 구조를 만들어라**

---

**💡 기억하세요**: 완벽한 아키텍처는 없습니다. 프로젝트의 규모와 요구사항에 맞는 적절한 수준의 추상화를 찾는 것이 중요합니다!
