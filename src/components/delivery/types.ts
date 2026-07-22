export type DeliveryStatus = 'ready' | 'pickedUp' | 'delivered';

export type DeliveryDropType = 'doorstep' | 'direct';

export type Delivery = {
  id: number;
  customerName: string;
  address: string;
  menuSummary: string;
  status: DeliveryStatus;
  dropType: DeliveryDropType;
  pickedUpAt?: string;
  deliveredAt?: string;
};

export type LocationData = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

export type StartPickupDto = {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  proofPhotoPath?: string;
  isLateNegotiated?: boolean;
};

export type CompleteDeliveryVerification =
  | { type: 'proof_photo'; proofPhotoPath: string }
  | { type: 'already_delivered'; reason: string };

export type CompleteDeliveryDto = {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
} & Partial<CompleteDeliveryVerification>;
