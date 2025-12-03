export type InvestigationMode = 'form' | 'portal';

export type InvestigationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type TargetType = 'company' | 'app' | 'influencer' | 'website' | 'other';

export type Recommendation = 'TRUST' | 'PROCEED_WITH_CAUTION' | 'AVOID' | 'HIGH_RISK_SCAM';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface RedFlag {
  flag: string;
  severity: Severity;
  evidence: string;
  impact: string;
}

export interface LegitimacyIndicator {
  indicator: string;
  strength: 'strong' | 'moderate' | 'weak';
  evidence: string;
}

export interface RiskCategory {
  level: RiskLevel;
  description: string;
}

export interface RiskBreakdown {
  financial: RiskCategory;
  privacy: RiskCategory;
  reputation: RiskCategory;
  legal: RiskCategory;
}

export interface BusinessIntelligence {
  business_model?: string;
  revenue_sources?: string;
  target_market?: string;
  competitive_position?: string;
  company_size?: string;
  funding_info?: string;
}

export interface EvidenceSource {
  source: string;
  url: string;
  key_findings: string[];
  reliability?: 'high' | 'medium' | 'low';
}

export interface Investigation {
  id: string;
  created_by: string;
  form_id?: string;

  // Target info
  target_name: string;
  target_type?: TargetType;
  target_url?: string;

  // Mode info
  investigation_mode?: InvestigationMode;

  // Status
  status: InvestigationStatus;

  // Form responses (if form mode)
  form_responses?: Record<string, any>;

  // Uploaded content (if portal mode)
  uploaded_files?: string[];
  pasted_content?: string;
  submitted_urls?: string[];

  // AI Analysis Results
  legitimacy_score?: number;
  confidence_level?: number;
  recommendation?: Recommendation;
  executive_summary?: string;

  // Structured results
  red_flags?: RedFlag[];
  legitimacy_indicators?: LegitimacyIndicator[];
  risk_breakdown?: RiskBreakdown;
  business_intelligence?: BusinessIntelligence;
  evidence_sources?: EvidenceSource[];
  key_findings?: string[];

  // Raw data
  raw_research_data?: Record<string, any>;

  // Report
  report_url?: string;
  report_sent_at?: string;

  // Client info
  client_email?: string;
  client_name?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateInvestigationInput {
  target_name: string;
  target_type?: TargetType;
  target_url?: string;
  investigation_mode: InvestigationMode;
  form_id?: string;
  client_email?: string;
  client_name?: string;
}

export interface AnalysisResult {
  legitimacy_score: number;
  confidence_level: number;
  recommendation: Recommendation;
  executive_summary: string;
  red_flags: RedFlag[];
  legitimacy_indicators: LegitimacyIndicator[];
  risk_breakdown: RiskBreakdown;
  business_intelligence: BusinessIntelligence;
  evidence_sources: EvidenceSource[];
  key_findings: string[];
  recommendations: {
    for_user: string[];
    next_steps: string[];
  };
}
