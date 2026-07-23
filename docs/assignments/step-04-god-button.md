# 4단계 — 갓 컴포넌트가 된 버튼: 흐름 소유권과 모달 결과 채널

> 버튼 하나가 화면급 책임을 지고 있다.
> 명령형 모달의 반쪽 전환이 어떻게 콜백 배선과 죽은 코드를 만드는지 추적하고, 소유권을 제자리로 옮긴다.

배달 라이더 앱의 "픽업 시작"과 "배달 완료" 버튼을 리팩토링하는 실습입니다. 실제 서비스 코드 리뷰에서 나온 구조 문제를 축소 재현했습니다.

기능은 전부 정상 동작합니다. 이 실습에서 고치는 것은 동작이 아니라 구조입니다.

## 왜 이 과제를 하는가

- 3단계까지는 한 컴포넌트 안의 관심사를 갈랐습니다. 이번에는 여러 컴포넌트에 걸친 흐름의 소유권을 다룹니다.
- 명령형 모달 인터페이스가 단방향일 때(`open()`이 `void`), 결과가 콜백 prop으로 역류하면서 배선이 여는 쪽에 쌓입니다. 이 구조적 원인을 진단하는 것이 과제의 핵심입니다.
- 같은 흐름의 소유자가 두 개가 되는 이중 마운트 문제를 직접 관찰하고, 구조로 불가능하게 만듭니다.

## 실습 대상

`src/components/delivery/`. 앱의 "4단계 배달 관리" 탭에서 동작을 확인할 수 있습니다.

`lib/` 폴더와 `DevToolbar.tsx`, `src/mocks/handlers.ts`는 실습 인프라라서 수정 대상이 아닙니다.

## 이번 과제

| # | 미션 | 완료 기준 |
| --- | --- | --- |
| 0 | 구조 관찰 | 버튼의 책임 목록 + 모달 인스턴스 수 + 이중 흐름 재현 기록 |
| 1 | 죽은 리셋 찾기 | onClose 리셋 4곳의 호출 경로 추적, 이유 서술 후 제거 |
| 2 | 결과가 돌아오는 모달 | `open(): Promise<outcome>` 전환, 콜백 prop 제거 |
| 3 | 흐름을 훅으로, 모달을 화면으로 | 흐름 훅 + 모달 화면 1세트, 버튼은 얇은 트리거 |
| 심화 | overlay 패턴 | 선택 과제 |

## 화면 사용법

상단 개발자 도구에서 위치 동의와 위치 권한을 토글할 수 있습니다. 배달 데이터 초기화 버튼으로 서버 상태를 처음으로 되돌립니다.

배달 3건은 각각 다른 경로를 태우도록 준비되어 있습니다.

| 배달 | 픽업 시작 | 배달 완료 |
| --- | --- | --- |
| 김서준 | 사진 인증 요구 (422) | 사진 인증 요구 (422) |
| 이하은 | 사진 인증 → 지연 사유까지 요구 (422 두 번) | 사진 인증 요구 (422) |
| 박도윤 | 바로 성공 | 바로 성공 (직접 전달) |

서버(MSW)는 위치를 판정해서 부족한 인증을 422 응답으로 알려주고, 클라이언트는 사진이나 사유를 붙여 같은 API를 다시 호출합니다.

## 배경: 지금 구조

버튼을 눌렀을 때 일어나는 일을 따라가 보면, 흐름 전체가 버튼 컴포넌트 안에 있습니다.

```
DeliveryListScreen
├ DeliveryCard × N                     DeliveryDetailPanel (카드 클릭 시)
│  ├ PickupStartButton                 ├ PickupStartButton      ← 같은 배달의
│  │  ├ LocationConsentModal    ref    │  └ 모달 4개 또 한 세트      흐름 소유자가 2개
│  │  ├ LocationPermissionModal ref    └ DeliveryCompleteButton
│  │  ├ PhotoProofSheet         ref       └ 모달 4개 또 한 세트
│  │  └ LateReasonSheet         ref
│  └ DeliveryCompleteButton
│     ├ LocationConsentModal    ref
│     ├ LocationPermissionModal ref
│     ├ PhotoProofSheet         ref
│     └ AlreadyDeliveredReasonSheet ref
│
│   ↓ 명령 (ref.open)    ↑ 결과가 콜백으로 돌아옴 (onSubmit·onAlreadyDelivered·onClose)
```

버튼 하나가 위치 권한 흐름, 위치 획득, API 호출, 422 분기, 모달 4개의 여닫기와 콜백 배선까지 들고 있습니다. 버튼이 primitive 액션 컴포넌트가 아니라 화면급 책임을 가진 컴포넌트가 되어 있습니다.

## 미션 0: 구조 관찰

코드를 고치기 전에 문제를 직접 확인합니다.

1. `PickupStartButton.tsx`를 읽고, 이 컴포넌트가 소유한 책임을 목록으로 적어보세요. 상태와 ref가 각각 몇 개인지도 세어보세요.
2. React DevTools를 열고 컴포넌트 트리에서 `PhotoProofSheet` 인스턴스가 몇 개 마운트되어 있는지 세어보세요. 카드를 클릭해 상세를 연 다음 다시 세어보세요.
3. 상세를 연 상태에서 상세의 버튼으로 흐름을 시작해 시트를 열고, ESC로 닫은 뒤, 이번엔 목록 카드의 버튼으로 같은 배달의 흐름을 시작해보세요. 두 흐름이 서로를 전혀 모른다는 것을 확인합니다.

같은 배달에 대해 흐름의 소유자가 두 개가 되는 상황입니다. 실제 서비스에서는 이 이중 마운트가 한 이벤트를 두 곳에서 소비하는 버그의 뿌리가 됐습니다.

## 미션 1: 죽은 리셋 찾기

모달이 "그냥 닫혔다"는 신호가 `onClose` 콜백으로 부모에 돌아와서 상태를 리셋하는 자리가 네 곳 있습니다.

- `PickupStartButton`의 `handleProofSheetClose`, `handleLateReasonClose`
- `DeliveryCompleteButton`의 `handleCompleteExceptionClose` (시트 두 개에 배선)

이 리셋들은 없어도 동작이 같습니다. 코드를 추적해서 그 이유를 직접 확인하는 것이 이 미션입니다.

1. `pickupAttemptRef`를 읽는 곳과 새 값으로 덮어쓰는 곳을 전부 찾아보세요. 시트가 닫힌 뒤 남아 있던 attempt를 읽을 수 있는 경로가 있나요?
2. `handleCompleteExceptionClose`의 `handleLoadingState(false)`는 시트가 열리는 시점에 이미 실행된 뒤인지 확인해보세요. 어느 `finally`가 먼저 실행되나요?
3. 확인이 끝나면 네 곳의 리셋을 제거하고, 세 배달의 전체 흐름이 그대로 동작하는지 다시 태워보세요.

### 자가 점검

- 왜 없어도 동작이 같은지 두 문장으로 설명할 수 있다.
- 제거 후 배달 3건의 픽업·완료 흐름이 전부 성공한다.
- 시트를 백드롭이나 ESC로 닫은 뒤 다시 시도해도 이전 시도의 상태가 남아 있지 않다.

## 미션 2: 결과가 돌아오는 모달

이 실습의 핵심 미션입니다.

여는 쪽은 이미 명령형입니다. 422를 받은 그 자리에서 `ref.open()`을 호출합니다. 문제는 돌아오는 쪽입니다. `open()`이 `void`라서, 시트 안에서 나중에 일어나는 사용자 결정(제출 / 이미 전달 / 그냥 닫음)을 연 쪽에 돌려줄 채널이 없습니다.

그래서 결과가 `onSubmit`·`onAlreadyDelivered` 콜백으로 올라가고, 그 흐름대로 "닫혔다"까지 `onClose`로 올라가면서 미션 1에서 지운 리셋 배선이 생겼던 것입니다. 절반만 명령형으로 전환된 상태입니다.

시트를 연 쪽이 알아야 하는 것은 "시트가 닫혔다"가 아니라 "사용자가 무엇을 결정했다"입니다. `open()`이 결과 promise를 반환하게 바꾸세요.

```typescript
type PhotoProofOutcome =
  | { type: 'submitted'; uploadedPath: string }
  | { type: 'alreadyDelivered' }
  | { type: 'dismissed' };

type PhotoProofSheetRef = {
  open: (flow: PhotoProofFlow) => Promise<PhotoProofOutcome>;
};
```

시트 내부는 resolve 함수를 ref에 보관했다가, 닫힐 때 대기 중인 결과(없으면 `dismissed`)로 resolve하는 구조가 됩니다. 버튼 쪽에서는 422를 받은 자리에서 결과를 기다리면 되고, 모달이 이어지는 흐름이 순차 `await` 분기로 읽히게 됩니다.

```typescript
if (attempt.proofPhotoPath === undefined && isLocationVerificationFailedError(error)) {
  const outcome = await photoProofSheetRef.current?.open('pickup');
  if (outcome?.type !== 'submitted') {
    return;
  }
  attempt.proofPhotoPath = outcome.uploadedPath;
  // 재시도
}
```

네 모달(`PhotoProofSheet`, `LocationConsentModal`, `LateReasonSheet`, `AlreadyDeliveredReasonSheet`) 모두 같은 방식으로 전환하세요.

### 자가 점검

- 모달 컴포넌트에 `onClose`·`onSubmit` 계열 prop이 하나도 남아 있지 않다.
- 시트가 닫힌 이유를 가려내던 `handleHide`의 `pendingActionRef` 분기가 resolve 한 줄로 줄었다.
- 버튼의 흐름이 위에서 아래로 읽힌다. 콜백을 따라 파일 안을 오르내리지 않아도 된다.
- `PhotoProofSheet`의 세대 카운터(`sheetGenerationRef`)와 이중 화살표 `useEffect(() => () => {...})`가 여전히 필요한지 다시 판단해보세요.

## 미션 3: 흐름을 훅으로, 모달을 화면으로

미션 2가 끝나면 버튼은 여전히 흐름과 모달 4개를 소유하고 있습니다. 이제 소유권을 옮깁니다.

목표 위계입니다.

```
DeliveryListScreen
├ usePickupFlow() / useCompleteFlow()      ← 흐름 소유자 (화면당 1개)
├ DeliveryCard / DeliveryDetailPanel
│   └ 버튼 = flow.start(delivery) 호출만    ← 얇은 트리거
└ 모달 1세트 (화면 위계, 동일 레벨)
    ├ LocationConsentModal
    ├ LocationPermissionModal
    ├ PhotoProofSheet
    ├ LateReasonSheet
    └ AlreadyDeliveredReasonSheet
```

순서가 중요합니다. 미션 2(결과 채널)가 선행되지 않으면, 모달을 화면으로 올려도 콜백 배선이 버튼에서 화면으로 자리만 옮겨갑니다.

1. 위치 동의 → 권한 → 위치 획득을 묶은 `useLocationGate`를 만들고, 픽업과 완료가 공유하게 하세요.
2. 위치 확인 → API 호출 → 422 분기 → 추가 입력 → 재시도 정책을 `usePickupFlow`와 `useCompleteFlow`로 빼세요.
3. 모달 5개를 `DeliveryListScreen`에 한 세트만 선언하고, 흐름 훅이 ref로 사용하게 하세요.
4. 버튼은 `flow.start(delivery)`를 호출하는 한 줄로 줄이세요. 버튼 UI는 카드와 상세에 그대로 둡니다. 옮기는 것은 흐름과 모달의 소유권입니다.

### 자가 점검

- React DevTools에서 `PhotoProofSheet` 인스턴스가 화면 전체에 1개다. 상세를 열어도 늘어나지 않는다.
- 같은 배달의 흐름 소유자가 1개다. 목록 버튼과 상세 버튼이 같은 훅 인스턴스를 호출한다.
- 흐름 진행 중 다른 버튼이 잠긴다. 미션 0에서 관찰한 이중 흐름이 구조적으로 불가능해졌다.
- 배달 3건의 전체 경로(사진, 사진+지연, 이미 전달, 직접 전달)가 전부 동작한다.

## 심화 미션: overlay 패턴

미션 2에서 만든 결과 채널은 직접 구현했지만, 같은 문제를 라이브러리 차원에서 푸는 방식이 있습니다.

토스의 [overlay-kit](https://github.com/toss/overlay-kit)은 모달을 JSX에 선언하지 않고, 여는 이벤트 핸들러 안에서 `overlay.openAsync`로 열어 결과를 `close(result)`로 돌려받습니다.

```typescript
const outcome = await overlay.openAsync<PhotoProofOutcome>(({ isOpen, close }) => (
  <PhotoProofSheet isOpen={isOpen} flow="pickup" onDone={close} />
));
```

모달을 쓰기 위해 JSX 선언과 ref가 필요하다는 제약 자체가 사라지므로, 미션 3에서 화면에 올린 모달 세트도 필요 없어집니다. 관심 있으면 의존성을 추가해 미션 3 결과물을 이 방식으로 한 번 더 바꿔보세요.

## 제출

포크에서 작업 브랜치를 만들어 진행하고, 메인 레포로 PR을 엽니다. 미션 단위로 커밋을 나누고, 미션 0과 1의 서술 답변(책임 목록, 죽은 리셋인 이유)은 PR 본문에 적습니다.

## 정답

`solution-step-04` 브랜치에 미션 1~3을 반영한 코드가 있습니다. 스스로 풀기 전에 열어보면 이 실습으로 얻을 것이 별로 남지 않습니다.
