import { config } from "../../config";
import axios from "axios";

const AUDIT_ENDPOINT = "/audit/";


export interface AuditLogChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  changes: AuditLogChange[];
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
  comment?: string;
}

export interface GetAuditLogsResponse {
  auditLogs: AuditLog[];
  totalCount: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface AuditLogOptions {
  startDate?: string;
  endDate?: string;
  actions?: ('CREATE' | 'UPDATE' | 'DELETE')[];
  status?: 'SUCCESS' | 'FAILED';
  limit?: number;
  skip?: number;
}


export const getEntityAuditLogs = async (
  authToken: string,
  entityType: string,
  entityId: string,
  options?: AuditLogOptions
): Promise<GetAuditLogsResponse> => {
  const params = new URLSearchParams();

  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);
  if (options?.actions) params.append('actions', options.actions.join(','));
  if (options?.status) params.append('status', options.status);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.skip) params.append('skip', options.skip.toString());

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const apiURL = `${config.APIBaseURL}${AUDIT_ENDPOINT}entity/${entityType}/${entityId}${queryString}`;

  const response = await axios.get<GetAuditLogsResponse>(apiURL, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  return response.data;
};


export const getAllAuditLogs = async (
  authToken: string,
  options?: {
    entity_type?: string;
    entity_id?: string;
    user_id?: string;
    action?: 'CREATE' | 'UPDATE' | 'DELETE';
    startDate?: string;
    endDate?: string;
    status?: 'SUCCESS' | 'FAILED';
    limit?: number;
    skip?: number;
  }
): Promise<GetAuditLogsResponse> => {
  const params = new URLSearchParams();

  if (options?.entity_type) params.append('entity_type', options.entity_type);
  if (options?.entity_id) params.append('entity_id', options.entity_id);
  if (options?.user_id) params.append('user_id', options.user_id);
  if (options?.action) params.append('action', options.action);
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);
  if (options?.status) params.append('status', options.status);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.skip) params.append('skip', options.skip.toString());

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const apiURL = `${config.APIBaseURL}${AUDIT_ENDPOINT}${queryString}`;

  const response = await axios.get<GetAuditLogsResponse>(apiURL, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  return response.data;
};


export const getRecentActivity = async (
  authToken: string,
  limit?: number
): Promise<AuditLog[]> => {
  const queryString = limit ? `?limit=${limit}` : '';
  const apiURL = `${config.APIBaseURL}${AUDIT_ENDPOINT}recent${queryString}`;

  const response = await axios.get<AuditLog[]>(apiURL, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  return response.data;
};


export const getAuditSummary = async (
  authToken: string
): Promise<any> => {
  const apiURL = `${config.APIBaseURL}${AUDIT_ENDPOINT}summary`;

  const response = await axios.get(apiURL, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  return response.data;
};