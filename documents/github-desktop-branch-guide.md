# GitHub Desktop에서 브랜치 관리하기

## 목차

1. [브랜치 생성](#1-브랜치-생성)
2. [브랜치 전환](#2-브랜치-전환)
3. [브랜치 병합](#3-브랜치-병합)
4. [브랜치 삭제](#4-브랜치-삭제)
5. [브랜치 관리 모범 사례](#5-브랜치-관리-모범-사례)

## 1. 브랜치 생성

### 1.1 새 브랜치 생성하기

1. GitHub Desktop의 현재 브랜치 드롭다운 메뉴 클릭
2. "New Branch" 버튼 클릭
3. 새 브랜치 이름 입력
4. "Create Branch" 버튼 클릭

### 1.2 브랜치 명명 규칙

- `feature/`: 새로운 기능 개발
- `bugfix/`: 버그 수정
- `hotfix/`: 긴급 수정
- `release/`: 릴리스 준비
- `docs/`: 문서 작업

예시:
```
feature/user-authentication
bugfix/login-error
docs/api-documentation
```

## 2. 브랜치 전환

### 2.1 브랜치 전환 방법

1. 현재 브랜치 드롭다운 메뉴 클릭
2. 전환하려는 브랜치 선택
3. 또는 `Ctrl + Shift + B` (Windows) / `Cmd + Shift + B` (Mac) 단축키 사용

### 2.2 작업 중인 변경사항 처리

- 커밋되지 않은 변경사항이 있는 경우:
  1. 변경사항 커밋
  2. 스태시(Stash) 사용
  3. 변경사항 버리기

## 3. 브랜치 병합

### 3.1 로컬 병합

1. 대상 브랜치로 전환
2. "Branch" 메뉴에서 "Merge into Current Branch" 선택
3. 병합할 브랜치 선택
4. 충돌 발생 시 해결

### 3.2 충돌 해결

1. 충돌이 발생한 파일 확인
2. 각 파일의 충돌 부분 수정
3. 수정된 파일 스테이징
4. 병합 커밋 생성

## 4. 브랜치 삭제

### 4.1 로컬 브랜치 삭제

1. 브랜치 드롭다운 메뉴 클릭
2. 삭제할 브랜치 우클릭
3. "Delete" 선택

### 4.2 원격 브랜치 삭제

1. GitHub 웹사이트에서 브랜치 삭제
2. GitHub Desktop에서 "Fetch origin" 수행
3. 로컬에서 원격 브랜치 참조 정리

## 5. 브랜치 관리 모범 사례

### 5.1 브랜치 구조

```
main (또는 master)
├── develop
│   ├── feature/feature-name
│   ├── bugfix/bug-description
│   └── docs/documentation-update
└── hotfix/urgent-fix
```

### 5.2 브랜치 관리 원칙

1. **브랜치 최신 상태 유지**
   - 정기적으로 기본 브랜치의 변경사항 가져오기
   - 병합 전 최신 상태로 업데이트

2. **명확한 브랜치 목적**
   - 각 브랜치는 하나의 목적만 가짐
   - 작업 범위를 명확히 정의

3. **정기적인 정리**
   - 병합된 브랜치 주기적 삭제
   - 오래된 브랜치 검토 및 정리

4. **커밋 메시지 품질**
   - 명확하고 설명적인 커밋 메시지
   - 관련 이슈 번호 참조

### 5.3 협업 시 주의사항

1. **브랜치 보호**
   - 주요 브랜치(main, develop) 보호 설정
   - 코드 리뷰 필수화

2. **커뮤니케이션**
   - 브랜치 생성 시 팀원에게 알림
   - 주요 변경사항 공유

3. **코드 리뷰**
   - 병합 전 코드 리뷰 진행
   - 피드백 적극 반영 