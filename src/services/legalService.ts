import { apiRequest, ApiResponse, getAccessToken } from './api';
import { ENV } from '../config/env';

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

export interface SSEEvent {
  event: 'pipeline_start' | 'agent1_start' | 'agent1_done' | 'agent2_start' | 'agent2_question' | 'agent2_done' | 'simulation_start' | 'simulation_done' | 'complete' | 'error';
  message: string;
  data?: any;
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

export const streamChatQuery = async (
  message: string,
  caseId: string | null,
  onEvent: (eventData: SSEEvent) => void,
  onClose: () => void,
  onError: (error: string) => void
): Promise<() => void> => {
  const token = await getAccessToken();
  const baseUrl = ENV.API_BASE_URL.endsWith('/') ? ENV.API_BASE_URL.slice(0, -1) : ENV.API_BASE_URL;
  const targetUrl = `${baseUrl}/api/v1/chat/query`;

  const xhr = new XMLHttpRequest();
  xhr.open('POST', targetUrl);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');
  if (token) {
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  }

  let lastProcessedIndex = 0;
  let buffer = '';

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 3 || xhr.readyState === 4) {
      try {
        const currentText = xhr.responseText;
        const chunk = currentText.substring(lastProcessedIndex);
        lastProcessedIndex = currentText.length;

        buffer += chunk;
        let lineEndIndex;
        while ((lineEndIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.substring(0, lineEndIndex).trim();
          buffer = buffer.substring(lineEndIndex + 1);
          if (line.startsWith('data:')) {
            const jsonStr = line.substring(5).trim();
            try {
              const parsed = JSON.parse(jsonStr) as SSEEvent;
              onEvent(parsed);
            } catch (e) {
              console.warn("Failed to parse SSE JSON:", jsonStr, e);
            }
          }
        }
      } catch (err: any) {
        console.warn("[SSE] Error parsing stream chunk:", err.message);
      }
    }

    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        onClose();
      } else {
        onError(`Server returned status ${xhr.status}`);
      }
    }
  };

  xhr.onerror = (err) => {
    onError('Network error occurred during streaming.');
  };

  xhr.send(JSON.stringify({ message, case_id: caseId }));
  
  return () => {
    xhr.abort();
  };
};

