import React, { useState, useMemo } from 'react';
import { FilterType, Todo, useTodos, useTodoStorage, useNotification } from '../hooks';
import { getFilteredAndSortedTodos, calculateTodoStats } from '../utils';

const TodoList: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  // 커스텀 훅들 사용
  const { todos, setTodos, addTodo, toggleTodo, deleteTodo } = useTodos();
  const { isLoading } = useTodoStorage(todos, setTodos);
  const { notification, error, inputError, showNotification, showError, clearError } =
    useNotification();

  // utils를 사용한 계산들
  const filteredAndSortedTodos = useMemo(
    () => getFilteredAndSortedTodos(todos, filter),
    [todos, filter],
  );

  const stats = useMemo(() => calculateTodoStats(todos), [todos]);

  // 할일 추가 핸들러
  const handleAddTodo = () => {
    const result = addTodo(inputValue);

    if (!result.isValid) {
      showError(result.errorMessage);
      return;
    }

    clearError();
    setInputValue('');
    showNotification(`새로운 할일이 추가되었습니다: ${inputValue.trim()}`);
  };

  // 할일 삭제 핸들러
  const handleDeleteTodo = (id: number) => {
    const success = deleteTodo(id);
    if (success) {
      showNotification('할일이 삭제되었습니다!');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          fontSize: '18px',
        }}
      >
        로딩 중...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>할일 목록 (함수형 프로그래밍 버전)</h1>

      {/* 알림 메시지 */}
      {notification && (
        <div
          style={{
            marginBottom: '10px',
            padding: '10px',
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
          }}
        >
          {notification}
        </div>
      )}

      <div
        style={{
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: error || inputError ? '#ffebee' : '#f5f5f5',
          border: error || inputError ? '2px solid red' : '1px solid #ddd',
          borderRadius: '4px',
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            // 긴 입력값에 대한 경고를 콘솔 대신 상태로 관리할 수 있음
          }}
          onKeyPress={handleKeyPress}
          placeholder="할일을 입력하세요 (! = 높은 우선순위, ? = 중간 우선순위)"
          style={{
            width: '70%',
            padding: '8px',
            marginRight: '10px',
            borderColor: inputValue.length > 0 ? '#4caf50' : '#ddd',
            borderWidth: '2px',
            borderStyle: 'solid',
            backgroundColor: inputError ? '#ffebee' : 'white',
          }}
        />
        <button
          onClick={handleAddTodo}
          style={{
            padding: '8px 16px',
            backgroundColor: inputValue.trim() ? '#4caf50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          추가
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <div style={{ marginBottom: '20px' }}>
        {(['all', 'pending', 'completed'] as FilterType[]).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            style={{
              marginRight: '10px',
              padding: '5px 10px',
              backgroundColor: filter === filterType ? '#2196f3' : '#f0f0f0',
              color: filter === filterType ? 'white' : 'black',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {filterType === 'all' ? '전체' : filterType === 'pending' ? '미완료' : '완료'}
          </button>
        ))}
      </div>

      <div
        style={{
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
        }}
      >
        <strong>통계:</strong> 전체 {stats.total}개, 완료 {stats.completed}개, 미완료{' '}
        {stats.pending}개
      </div>

      <div>
        {filteredAndSortedTodos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>
            {filter === 'all'
              ? '할일이 없습니다.'
              : filter === 'pending'
                ? '미완료 할일이 없습니다.'
                : '완료된 할일이 없습니다.'}
          </p>
        ) : (
          filteredAndSortedTodos.map((todo: Todo) => (
            <div
              key={todo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                marginBottom: '5px',
                backgroundColor: todo.completed ? '#f0f8f0' : '#fff',
                border: `2px solid ${
                  todo.priority === 'high'
                    ? '#f44336'
                    : todo.priority === 'medium'
                      ? '#ff9800'
                      : '#4caf50'
                }`,
                borderRadius: '4px',
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                style={{ marginRight: '10px' }}
              />
              <span
                style={{
                  flex: 1,
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? '#666' : '#000',
                }}
              >
                {todo.text}
                <small
                  style={{
                    marginLeft: '10px',
                    color: '#999',
                    fontSize: '12px',
                  }}
                >
                  ({todo.priority} 우선순위, {todo.createdAt.toLocaleString()})
                </small>
              </span>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                style={{
                  marginLeft: '10px',
                  padding: '5px 10px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#fff3e0',
          fontSize: '12px',
          borderRadius: '4px',
        }}
      >
        <strong>디버그 정보:</strong>
        <br />
        전체 할일: {stats.total}개
        <br />
        완료: {stats.completed}개, 미완료: {stats.pending}개
        <br />
        현재 필터: {filter}
        <br />
        필터된 할일: {filteredAndSortedTodos.length}개
        <br />
        입력값 길이: {inputValue.length}
      </div>
    </div>
  );
};

export default TodoList;
