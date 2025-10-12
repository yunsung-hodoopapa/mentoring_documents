# 초급자를 위한 React 함수형 프로그래밍 실습

## 📋 실습 개요

이 실습은 **React를 이제 막 배우기 시작한 초급자**를 위한 간단한 리팩토링 연습입니다.

**대상 파일**: `src/components/SimpleTodoBad.tsx` (약 120줄)

## 🎯 학습 목표

1. **순수 함수**가 무엇인지 이해하기
2. **불변성**을 지키는 방법 배우기
3. **전역 변수 사용의 문제점** 알아보기
4. **React 상태 관리**의 올바른 방법 익히기

## 🚨 찾아야 할 6가지 문제점

### 문제 1: 전역 변수 사용 ❌

```tsx
// 🚨 문제가 있는 코드
let todoId = 0;

const generateId = () => {
  todoId += 1; // 전역 변수를 수정
  return todoId;
};
```

**왜 문제일까요?**

- 함수를 호출할 때마다 결과가 달라집니다
- 테스트하기 어렵습니다
- 여러 컴포넌트에서 사용하면 충돌할 수 있습니다

### 문제 2: 과도한 useEffect ❌

```tsx
// 🚨 문제가 있는 코드
useEffect(() => {
  console.log('할일이 변경되었습니다:', todos);
}, [todos]);

useEffect(() => {
  document.title = `할일 ${todos.length}개`;
}, [todos]);
```

**왜 문제일까요?**

- 너무 많은 useEffect는 성능을 떨어뜨립니다
- 로직이 여기저기 흩어져서 이해하기 어렵습니다

### 문제 3: 배열 직접 수정 ❌

```tsx
// 🚨 문제가 있는 코드
const addTodo = () => {
  const newTodo = {
    /* ... */
  };
  todos.push(newTodo); // 배열을 직접 수정
  setTodos(todos); // 같은 참조를 다시 설정
};
```

**왜 문제일까요?**

- React가 변경을 감지하지 못할 수 있습니다
- 예상치 못한 버그가 발생할 수 있습니다

### 문제 4: 객체 직접 수정 ❌

```tsx
// 🚨 문제가 있는 코드
const toggleTodo = (todo: Todo) => {
  todo.completed = !todo.completed; // 객체를 직접 수정
  setTodos([...todos]);
};
```

### 문제 5: 배열에서 직접 제거 ❌

```tsx
// 🚨 문제가 있는 코드
const deleteTodo = (id: number) => {
  const index = todos.findIndex((todo) => todo.id === id);
  todos.splice(index, 1); // 배열을 직접 수정
  setTodos([...todos]);
};
```

### 문제 6: 매번 새로 계산하는 함수 ❌

```tsx
// 🚨 문제가 있는 코드
const getFilteredTodos = () => {
  // 렌더링할 때마다 매번 실행됨
  if (filter === 'completed') {
    return todos.filter((todo) => todo.completed);
  }
  // ...
};
```

## 🔧 단계별 수정 방법

### 1단계: 순수 함수로 ID 생성하기

**현재 문제점:**

```tsx
let todoId = 0;
const generateId = () => {
  todoId += 1;
  return todoId;
};
```

**✅ 올바른 방법:**

```tsx
const generateId = (existingTodos: Todo[]): number => {
  if (existingTodos.length === 0) return 1;
  return Math.max(...existingTodos.map((t) => t.id)) + 1;
};
```

**왜 더 좋을까요?**

- 전역 변수를 사용하지 않습니다
- 같은 입력에 대해 항상 같은 결과를 줍니다
- 테스트하기 쉽습니다

### 2단계: 불변성을 지키며 할일 추가하기

**현재 문제점:**

```tsx
const addTodo = () => {
  const newTodo = {
    /* ... */
  };
  todos.push(newTodo); // ❌ 직접 수정
  setTodos(todos);
};
```

**✅ 올바른 방법:**

```tsx
const addTodo = () => {
  if (inputValue.trim()) {
    const newTodo = {
      id: generateId(todos),
      text: inputValue,
      completed: false,
    };

    setTodos([...todos, newTodo]); // ✅ 새로운 배열 생성
    setInputValue('');
  }
};
```

### 3단계: 불변성을 지키며 할일 토글하기

**현재 문제점:**

```tsx
const toggleTodo = (todo: Todo) => {
  todo.completed = !todo.completed; // ❌ 직접 수정
  setTodos([...todos]);
};
```

**✅ 올바른 방법:**

```tsx
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

### 4단계: 불변성을 지키며 할일 삭제하기

**현재 문제점:**

```tsx
const deleteTodo = (id: number) => {
  const index = todos.findIndex((todo) => todo.id === id);
  todos.splice(index, 1); // ❌ 직접 수정
  setTodos([...todos]);
};
```

**✅ 올바른 방법:**

```tsx
const deleteTodo = (id: number) => {
  setTodos(todos.filter((todo) => todo.id !== id)); // ✅ 새 배열 생성
};
```

### 5단계: useMemo로 성능 최적화하기

**현재 문제점:**

```tsx
const getFilteredTodos = () => {
  // 매번 새로 계산됨
  if (filter === 'completed') {
    return todos.filter((todo) => todo.completed);
  }
  // ...
};
```

**✅ 올바른 방법:**

```tsx
import { useMemo } from 'react';

const filteredTodos = useMemo(() => {
  if (filter === 'completed') {
    return todos.filter((todo) => todo.completed);
  }
  if (filter === 'pending') {
    return todos.filter((todo) => !todo.completed);
  }
  return todos;
}, [todos, filter]); // todos나 filter가 변경될 때만 다시 계산
```

### 6단계: 불필요한 useEffect 제거하기

**현재 문제점:**

```tsx
useEffect(() => {
  console.log('할일이 변경되었습니다:', todos);
}, [todos]);

useEffect(() => {
  document.title = `할일 ${todos.length}개`;
}, [todos]);
```

**✅ 개선 방법:**

```tsx
// 하나의 useEffect로 합치기
useEffect(() => {
  document.title = `할일 ${todos.length}개`;
  console.log('할일이 변경되었습니다:', todos);
}, [todos]);
```

## ✅ 완성된 코드 확인하기

모든 수정을 완료한 후, 다음을 확인해보세요:

1. **전역 변수가 없나요?**
2. **배열이나 객체를 직접 수정하지 않나요?**
3. **함수들이 예측 가능한 결과를 주나요?**
4. **불필요한 useEffect가 없나요?**

## 🎉 수고하셨습니다!

이제 여러분은 React에서 함수형 프로그래밍의 기본 원칙을 이해하게 되었습니다:

- ✅ **순수 함수**: 같은 입력에 같은 출력
- ✅ **불변성**: 데이터를 직접 수정하지 않기
- ✅ **예측 가능성**: 코드의 동작을 쉽게 예상할 수 있기

## 📚 다음 단계

이 기본기를 익혔다면, 다음을 도전해보세요:

1. **컴포넌트 분리**: 큰 컴포넌트를 작은 컴포넌트들로 나누기
2. **커스텀 훅**: 로직을 재사용 가능한 훅으로 분리하기
3. **타입 안전성**: TypeScript를 더 적극적으로 활용하기

---

**💡 팁**: 한 번에 모든 것을 고치려고 하지 마세요! 하나씩 차근차근 수정하면서 동작을 확인해보세요.
