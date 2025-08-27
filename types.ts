
export type IPStatus = 'up' | 'down' | 'pending';
export type IPType = 'Internal' | 'External';

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