# 1단계 — React 함수형 기초: 전역 변수와 직접 수정을 걷어낸다

> 같은 입력이면 같은 결과가 나오고, 데이터는 직접 고치지 않는다.
> 이 두 가지 감각이 이후 모든 단계의 바닥이 된다.

## 왜 이 과제를 하는가

- React는 "상태가 바뀌면 다시 그린다"는 약속 위에서 동작합니다. 배열과 객체를 직접 수정하면 React가 변경을 감지하지 못해, 화면이 갱신되지 않는 버그가 생깁니다.
- 전역 변수에 기대는 함수는 호출할 때마다 결과가 달라집니다. 테스트할 수 없고, 컴포넌트가 두 번 마운트되는 순간 어긋납니다.
- 파생할 수 있는 값을 상태로 들고 있으면 동기화 코드가 따라붙습니다. 계산할 수 있는 값은 계산합니다.

## 실습 대상

`src/components/SimpleTodoBad.tsx` (약 120줄). 앱의 "1단계 함수형 기초" 탭에서 동작을 확인할 수 있습니다.

## 이번 과제

| # | 과제 | 완료 기준 |
| --- | --- | --- |
| 1 | 문제점 6가지 찾기 — 코드를 읽고 아래 유형별로 위치를 짚는다 | 위치 · 문제 유형 · 왜 문제인지 한 줄, 표 1개 |
| 2 | 하나씩 수정 — 한 번에 하나씩 고치고 동작 확인 | 문제당 커밋 1개, 수정 후 탭에서 동작 확인 |

찾아야 할 6가지 유형입니다.

1. 전역 변수를 수정하는 함수
2. 필요 이상으로 많은 useEffect
3. 배열 직접 수정 (`push`)
4. 객체 직접 수정 (프로퍼티 대입)
5. 배열에서 직접 제거 (`splice`)
6. 렌더링마다 다시 계산되는 함수

## 어떻게 진행하나

### 1. 순수 함수로 ID 생성하기

```tsx
// 문제
let todoId = 0;
const generateId = () => {
  todoId += 1;
  return todoId;
};
```

전역 변수 없이, 지금 있는 할일 목록만 보고 다음 ID를 계산할 수 있습니다.

```tsx
const generateId = (existingTodos: Todo[]): number => {
  if (existingTodos.length === 0) return 1;
  return Math.max(...existingTodos.map((t) => t.id)) + 1;
};
```

같은 입력이면 같은 결과가 나오고, 테스트할 수 있습니다.

### 2. 불변성을 지키며 추가하기

`todos.push(newTodo)` 후 `setTodos(todos)`는 같은 참조를 다시 설정하는 것이라 React가 변경을 모릅니다. 새 배열을 만들어 설정합니다.

```tsx
setTodos([...todos, newTodo]);
```

### 3. 불변성을 지키며 토글하기

`todo.completed = !todo.completed`는 객체 직접 수정입니다. 바뀐 항목만 새 객체로 교체합니다.

```tsx
setTodos(
  todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
);
```

### 4. 불변성을 지키며 삭제하기

`splice` 대신 `filter`로 새 배열을 만듭니다.

```tsx
setTodos(todos.filter((todo) => todo.id !== id));
```

### 5. 파생값은 계산한다

필터링된 목록은 `todos`와 `filter`에서 파생되는 값입니다. 매 렌더링 함수 호출 대신 `useMemo`로 계산합니다.

```tsx
const filteredTodos = useMemo(() => {
  if (filter === 'completed') return todos.filter((todo) => todo.completed);
  if (filter === 'pending') return todos.filter((todo) => !todo.completed);
  return todos;
}, [todos, filter]);
```

### 6. useEffect 정리하기

남은 effect마다 "외부 시스템과의 동기화인가"를 물어보세요. `document.title` 갱신은 외부(브라우저) 동기화라 남을 자격이 있습니다. `console.log`는 아닙니다.

## 셀프 리뷰

리뷰 요청 전, 내 diff를 처음부터 끝까지 직접 읽습니다.

1. 전역 변수가 남아 있지 않은가
2. 배열이나 객체를 직접 수정하는 곳이 없는가 (`push`, `splice`, 프로퍼티 대입)
3. 같은 입력에 같은 결과를 주지 않는 함수가 없는가
4. 파생값을 상태나 함수 재호출로 들고 있지 않은가
5. 남은 useEffect가 각각 외부 시스템과의 동기화인가

## 제출

포크에서 작업 브랜치를 만들어 진행하고, 메인 레포로 PR을 엽니다 (README의 제출 절차 참고). 문제점 표는 PR 본문에 넣습니다.

## 다음 단계

여기서 익힌 원칙이 규모가 커지면 어떻게 무너지는지를 [2단계 — Todo 리스트 리팩토링](step-02-todo-refactoring.md)에서 다룹니다.
