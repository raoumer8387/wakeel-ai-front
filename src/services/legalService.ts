import { apiRequest, ApiResponse } from './api';

export interface LegalAnalysisRequest {
  query: string;
}

export interface LegalSource {
  filename: string;
  section_number: string;
  title?: string;
  year?: number;
}

export interface LegalAnalysisResponse {
  brief: string;
  sources: LegalSource[];
}

export const analyzeLegalQuery = async (
  query: string
): Promise<ApiResponse<LegalAnalysisResponse>> => {
  return apiRequest<LegalAnalysisResponse>('/api/v1/legal/analyze', {
    method: 'POST',
    body: { query },
    authenticated: true,
  });
};
