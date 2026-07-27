import { useState } from 'react';
import { BackofficeLoginModal } from './components/BackofficeLogin/BackofficeLoginModal';
import { DeliveryListScreen } from './components/delivery/DeliveryListScreen';
import { RiderAppScreen } from './components/entry/RiderAppScreen';
import SimpleTodoBad from './components/SimpleTodoBad';
import TodoListBad from './components/TodoListBad';
import './App.css';

const EXERCISES = [
  { key: 'step-01', label: '1단계 함수형 기초' },
  { key: 'step-02', label: '2단계 Todo 리팩토링' },
  { key: 'step-03', label: '3단계 로그인 모달' },
  { key: 'step-04', label: '4단계 배달 관리' },
  { key: 'step-05', label: '5단계 진입 게이트' },
] as const;

type ExerciseKey = (typeof EXERCISES)[number]['key'];

function App() {
  const [exercise, setExercise] = useState<ExerciseKey>('step-01');

  return (
    <div className="App">
      <nav className="exercise-tabs">
        {EXERCISES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={exercise === key ? 'exercise-tab exercise-tab-active' : 'exercise-tab'}
            onClick={() => setExercise(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {exercise === 'step-01' ? <SimpleTodoBad /> : null}
      {exercise === 'step-02' ? <TodoListBad /> : null}
      {exercise === 'step-03' ? (
        <div className="container">
          <h1>백오피스 로그인</h1>
          <p>관심사 분리와 훅 추출 실습 (docs/assignments/step-03-login-modal.md)</p>

          <div className="test-info">
            <h3>테스트 계정</h3>
            <p>
              이메일: <code>admin@test.com</code>
            </p>
            <p>
              비밀번호: <code>password123</code>
            </p>
          </div>

          <BackofficeLoginModal>
            <button className="login-trigger-btn">백오피스 로그인</button>
          </BackofficeLoginModal>
        </div>
      ) : null}
      {exercise === 'step-04' ? <DeliveryListScreen /> : null}
      {exercise === 'step-05' ? <RiderAppScreen /> : null}
    </div>
  );
}

export default App;
