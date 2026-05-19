import { authenticatedRequest, ApiResponse, getAccessToken } from './api';
import { ENV } from '../config/env';

export interface Case {
  id: string;
  user_id: string;
  title: string;
  issue_type: string;
  status: 'draft' | 'analysed' | 'filed';
  legal_brief?: any;
  action_log?: any[];
  case_ref?: string;
  created_at: string;
  updated_at: string;
}

export interface CaseMessage {
  id: string;
  case_id: string;
  role: 'user' | 'agent1' | 'agent2';
  content: string;
  metadata_?: any;
  created_at: string;
}

export interface CaseDocument {
  id: string;
  case_id: string;
  type: string;
  file_path: string;
  generated_by: string;
  created_at: string;
}

export interface CaseStats {
  total_cases: number;
  documents_generated: number;
  rights_analysed: number;
  cases_filed: number;
}

export interface AgentActivity {
  id: string;
  title: string;
  subtitle: string;
  status: 'processing' | 'completed';
  updated_at?: string;
}

export const getCases = async (limit?: number): Promise<ApiResponse<{ cases: Case[] }>> => {
  const endpoint = limit !== undefined ? `/api/v1/cases/?limit=${limit}` : '/api/v1/cases/';
  return authenticatedRequest<{ cases: Case[] }>(endpoint, {
    method: 'GET',
  });
};

export const getCaseStats = async (): Promise<ApiResponse<CaseStats>> => {
  return authenticatedRequest<CaseStats>('/api/v1/cases/stats', {
    method: 'GET',
  });
};

export const getCaseActivity = async (): Promise<ApiResponse<AgentActivity[]>> => {
  return authenticatedRequest<AgentActivity[]>('/api/v1/cases/activity', {
    method: 'GET',
  });
};

export const getCaseDetails = async (caseId: string): Promise<ApiResponse<Case>> => {
  return authenticatedRequest<Case>(`/api/v1/cases/${caseId}`, {
    method: 'GET',
  });
};

export const getCaseMessages = async (caseId: string): Promise<ApiResponse<{ messages: CaseMessage[] }>> => {
  return authenticatedRequest<{ messages: CaseMessage[] }>(`/api/v1/cases/${caseId}/messages`, {
    method: 'GET',
  });
};

export const getCaseDocuments = async (caseId: string): Promise<ApiResponse<{ documents: CaseDocument[] }>> => {
  return authenticatedRequest<{ documents: CaseDocument[] }>(`/api/v1/documents/${caseId}`, {
    method: 'GET',
  });
};

export const getDocumentDownloadUrl = async (docId: string): Promise<string> => {
  const token = await getAccessToken();
  const baseUrl = ENV.API_BASE_URL.endsWith('/') ? ENV.API_BASE_URL.slice(0, -1) : ENV.API_BASE_URL;
  return `${baseUrl}/api/v1/documents/${docId}/download?token=${token}`;
};

export const createNewChat = async (): Promise<ApiResponse<{ case_id: string; status: string }>> => {
  return authenticatedRequest<{ case_id: string; status: string }>('/api/v1/chat/new', {
    method: 'POST',
  });
};
