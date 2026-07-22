import { delay, http, HttpResponse } from 'msw';

type DeliveryRecord = {
  id: number;
  customerName: string;
  address: string;
  menuSummary: string;
  status: 'ready' | 'pickedUp' | 'delivered';
  dropType: 'doorstep' | 'direct';
  pickedUpAt?: string;
  deliveredAt?: string;
  requiresPhotoProof: boolean;
  isLate: boolean;
};

const initialDeliveries: DeliveryRecord[] = [
  {
    id: 1,
    customerName: '김서준',
    address: '성수동 카페거리 12',
    menuSummary: '아메리카노 2잔 외 1건',
    status: 'ready',
    dropType: 'doorstep',
    requiresPhotoProof: true,
    isLate: false,
  },
  {
    id: 2,
    customerName: '이하은',
    address: '망원동 유수지길 3',
    menuSummary: '마르게리따 피자 1판',
    status: 'ready',
    dropType: 'doorstep',
    requiresPhotoProof: true,
    isLate: true,
  },
  {
    id: 3,
    customerName: '박도윤',
    address: '논현로 153길 7',
    menuSummary: '샐러드 볼 2개',
    status: 'ready',
    dropType: 'direct',
    requiresPhotoProof: false,
    isLate: false,
  },
];

let deliveries: DeliveryRecord[] = structuredClone(initialDeliveries);

function toClientDelivery(record: DeliveryRecord) {
  return {
    id: record.id,
    customerName: record.customerName,
    address: record.address,
    menuSummary: record.menuSummary,
    status: record.status,
    dropType: record.dropType,
    pickedUpAt: record.pickedUpAt,
    deliveredAt: record.deliveredAt,
  };
}

const deliveryHandlers = [
  http.get('/api/deliveries', async () => {
    await delay(300);
    return HttpResponse.json(deliveries.map(toClientDelivery));
  }),

  http.post('/api/deliveries/:id/pickup', async ({ request, params }) => {
    await delay(500);
    const delivery = deliveries.find((record) => record.id === Number(params.id));
    if (!delivery) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: '배달을 찾을 수 없어요.' }, { status: 404 });
    }
    if (delivery.status !== 'ready') {
      return HttpResponse.json(
        { code: 'INVALID_STATUS', message: '이미 픽업이 시작된 배달이에요.' },
        { status: 409 },
      );
    }

    const body = (await request.json()) as {
      proofPhotoPath?: string;
      isLateNegotiated?: boolean;
    };

    if (delivery.requiresPhotoProof && !body.proofPhotoPath) {
      return HttpResponse.json(
        { code: 'LOCATION_VERIFICATION_FAILED', message: '픽업 지점과 다른 위치로 확인돼요.' },
        { status: 422 },
      );
    }

    if (delivery.isLate && body.isLateNegotiated === undefined) {
      return HttpResponse.json(
        { code: 'LATE_NEGOTIATION_REQUIRED', message: '예정 픽업 시간보다 늦었어요.' },
        { status: 422 },
      );
    }

    delivery.status = 'pickedUp';
    delivery.pickedUpAt = new Date().toISOString();
    return HttpResponse.json({ pickedUpAt: delivery.pickedUpAt });
  }),

  http.post('/api/deliveries/:id/complete', async ({ request, params }) => {
    await delay(500);
    const delivery = deliveries.find((record) => record.id === Number(params.id));
    if (!delivery) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: '배달을 찾을 수 없어요.' }, { status: 404 });
    }
    if (delivery.status !== 'pickedUp') {
      return HttpResponse.json(
        { code: 'INVALID_STATUS', message: '배달 중 상태에서만 완료할 수 있어요.' },
        { status: 409 },
      );
    }

    const body = (await request.json()) as {
      type?: 'proof_photo' | 'already_delivered';
    };

    if (delivery.requiresPhotoProof && body.type === undefined) {
      return HttpResponse.json(
        { code: 'LOCATION_VERIFICATION_FAILED', message: '배달 주소와 다른 위치로 확인돼요.' },
        { status: 422 },
      );
    }

    delivery.status = 'delivered';
    delivery.deliveredAt = new Date().toISOString();
    return HttpResponse.json({ deliveredAt: delivery.deliveredAt });
  }),

  http.post('/api/uploads/proof', async () => {
    await delay(400);
    return HttpResponse.json({ path: `/uploads/proof-${Date.now()}.png` });
  }),

  http.post('/api/dev/deliveries/reset', async () => {
    deliveries = structuredClone(initialDeliveries);
    return HttpResponse.json({ ok: true });
  }),
];

const mockUsers = [
  {
    id: 1,
    email: 'admin@test.com',
    name: '관리자',
    roles: ['admin', 'user'],
  },
  {
    id: 2,
    email: 'manager@test.com',
    name: '매니저',
    roles: ['manager', 'user'],
  },
  {
    id: 3,
    email: 'user@test.com',
    name: '일반사용자',
    roles: ['user'],
  },
];

export const handlers = [
  ...deliveryHandlers,
  http.post('/api/backoffice/login', async ({ request }) => {
    const { username, password } = (await request.json()) as { username: string; password: string };

    const user = mockUsers.find((u) => u.email === username);

    if (!user) {
      return HttpResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (password !== 'password123') {
      return HttpResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    return HttpResponse.json({
      user,
      access_token: `mock_token_${user.id}_${Date.now()}`,
    });
  }),

  http.get('/api/backoffice/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: '인증 토큰이 필요합니다.' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    const userId = token.includes('mock_token_1')
      ? 1
      : token.includes('mock_token_2')
        ? 2
        : token.includes('mock_token_3')
          ? 3
          : null;

    if (!userId) {
      return HttpResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
      return HttpResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return HttpResponse.json({ user });
  }),
];
