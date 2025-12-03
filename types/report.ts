import type { Investigation, AnalysisResult } from './investigation';

export interface ReportData {
  investigation: Investigation;
  analysis: AnalysisResult;
  generated_at: string;
}

export interface EmailData {
  recipient: string;
  subject: string;
  investigation_id: string;
  client_name?: string;
}

export interface FormInvitationEmailData extends EmailData {
  form_title: string;
  form_url: string;
  expires_at?: string;
}

export interface ReportCompleteEmailData extends EmailData {
  target_name: string;
  legitimacy_score: number;
  recommendation: string;
  report_url: string;
  executive_summary: string;
}
