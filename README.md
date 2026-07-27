# 멘토링 리팩토링 프로젝트

React 리팩토링 멘토링 과제 레포입니다. 과제는 단계별로 빌드업됩니다 — 앞 단계에서 익힌 원칙이 다음 단계의 기반이 됩니다.

## 시작하기

```bash
npm install
npm run dev
```

> React 19 + Vite + TypeScript + MSW 기반입니다. 앱을 열면 단계별 실습 탭이 있습니다.

## 단계별 과제

| 단계 | 과제 | 핵심 주제 |
| --- | --- | --- |
| 0 | [환경과 제출 연습](docs/assignments/step-00-environment.md) | 커밋 게이트 · 셀프 리뷰 규칙 |
| 1 | [React 함수형 기초](docs/assignments/step-01-functional-basics.md) | 순수 함수 · 불변성 · 파생값 |
| 2 | [Todo 리스트 리팩토링](docs/assignments/step-02-todo-refactoring.md) | useEffect 정당성 · 상태 3분할 |
| 3 | [로그인 모달](docs/assignments/step-03-login-modal.md) | 관심사 분리 · 훅 추출 · service |
| 4 | [갓 컴포넌트가 된 버튼](docs/assignments/step-04-god-button.md) | 흐름 소유권 · 모달 결과 채널 · 화면 위계 |
| 5 | [화면을 초당 30번 다시 그리는 에러](docs/assignments/step-05-render-loop.md) | 로딩 상태 판정 · 렌더 루프 · 데이터로 진단하기 |

순서대로 진행하는 것을 권장합니다. 0단계에서 세운 커밋 게이트와 셀프 리뷰 규칙 위에서, 1단계의 "파생값은 계산한다"가 2단계의 effect 심사로, 2단계의 상태 구분이 3단계의 관심사 분리로, 3단계의 훅 추출이 4단계의 흐름 소유권으로 이어집니다. 5단계는 방향이 조금 다릅니다. 앞의 네 단계가 "동작은 되는데 구조가 나쁜" 코드를 다뤘다면, 5단계는 평범해 보이는 코드가 특정 조건에서 무너지는 상황을 데이터로 좁혀갑니다.

## 제출

1. 이 레포를 포크한다.
2. 포크에서 작업 브랜치를 만든다 (예: `feat/step-01`).
3. 과제를 진행하고 본인 포크에 커밋·푸시한다.
4. 메인 레포로 PR을 연다 (base: 메인 레포의 `main` ← compare: 본인 포크의 작업 브랜치). 각 과제 가이드가 요구하는 서술(문제점 표, 분리 근거 등)을 PR 본문에 채운다.
5. 멘토 리뷰와 다음 세션 구두 방어로 이어진다.

## 새 과제 받기

새 과제나 수정 사항은 이 메인 레포에 업데이트됩니다. 본인 포크의 `main`을 이 레포(upstream)와 동기화해 받으세요.

- 간단히: 포크한 GitHub 레포 페이지의 Sync fork 버튼.
- CLI: `git remote add upstream https://github.com/yunsung-hodoopapa/mentoring_documents.git` 등록 후 `git fetch upstream && git switch main && git merge upstream/main`.

## 참고 가이드

- [Prettier + ESLint 세팅](docs/guides/prettier-eslint-setup.md)
- [GitHub Flow](docs/guides/github-flow-guide.md)
- [GitHub Desktop 브랜치 관리](docs/guides/github-desktop-branch-guide.md)
- [Git 협업 명령어](docs/guides/git-collaboration-commands.md)

## 테스트 계정 (3단계 로그인 모달)

MSW 목 API가 응답합니다.

| 이메일 | 비밀번호 | 역할 |
| --- | --- | --- |
| `admin@test.com` | `password123` | admin, user |
| `manager@test.com` | `password123` | manager, user |
| `user@test.com` | `password123` | user |
