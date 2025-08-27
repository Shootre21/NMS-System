export type IPStatus = 'up' | 'down' | 'pending';
export type IPType = 'Internal' | 'External';
export type DeviceType = 'Firewall' | 'Switch';

export interface StatusHistory {
  status: IPStatus;
  timestamp: Date;
}

export interface IPS {
  id: string;
  address: string;
  status: IPStatus;
  type: IPType;
  lastSuccessfulPing: Date | null;
  name?: string;
  history: StatusHistory[];
}

export interface Device {
  id: string;
  address: string;
  name: string;
  status: IPStatus;
  type: DeviceType;
  lastSuccessfulPing: Date | null;
  model?: string;
}
