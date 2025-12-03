import { createMessage, extractTextContent, extractJSON } from './claude';
import type { AnalysisResult } from '@/types/investigation';
import type { ResearchData } from './web-research';
import type { DocumentAnalysis } from './analyze-document';

export interface InvestigationData {
  target_name: string;
  target_type?: string;
  target_url?: string;
  form_responses?: Record<string, any>;
  pasted_content?: string;
  submitted_urls?: string[];
  research?: ResearchData;
  document_analysis?: DocumentAnalysis[];
}

/**
 * Generate comprehensive analysis from all investigation data
 */
export async function generateComprehensiveAnalysis(
  data: InvestigationData
): Promise<AnalysisResult> {
  const prompt = buildAnalysisPrompt(data);

  const response = await createMessage({
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 8000,
    temperature: 0.3,
  });

  if (!response.success) {
    throw new Error(`Analysis generation failed: ${response.error}`);
  }

  const text = extractTextContent(response.data!);
  const analysis = extractJSON<AnalysisResult>(text);

  if (!analysis) {
    throw new Error('Failed to parse analysis JSON');
  }

  // Validate and ensure all required fields exist
  return validateAnalysis(analysis);
}

/**
 * Build the comprehensive analysis prompt
 */
function buildAnalysisPrompt(data: InvestigationData): string {
  let prompt = `You are a senior fraud detection analyst conducting a comprehensive investigation.

# TARGET INFORMATION
Name: ${data.target_name}
Type: ${data.target_type || 'Unknown'}
${data.target_url ? `URL: ${data.target_url}` : ''}

`;

  // Add form responses if available
  if (data.form_responses && Object.keys(data.form_responses).length > 0) {
    prompt += `\n## FORM RESPONSES\n${JSON.stringify(data.form_responses, null, 2)}\n`;
  }

  // Add pasted content if available
  if (data.pasted_content) {
    prompt += `\n## USER-PROVIDED CONTENT\n${data.pasted_content}\n`;
  }

  // Add submitted URLs
  if (data.submitted_urls && data.submitted_urls.length > 0) {
    prompt += `\n## SUBMITTED URLS\n${data.submitted_urls.join('\n')}\n`;
  }

  // Add web research
  if (data.research) {
    prompt += `\n## WEB RESEARCH RESULTS\n`;
    prompt += `Summary: ${data.research.summary}\n\n`;
    prompt += `Key Findings:\n${data.research.key_findings.map(f => `- ${f}`).join('\n')}\n\n`;
    data.research.searches.forEach(search => {
      prompt += `### ${search.query}\n${search.results}\n\n`;
    });
  }

  // Add document analysis
  if (data.document_analysis && data.document_analysis.length > 0) {
    prompt += `\n## DOCUMENT ANALYSIS\n`;
    data.document_analysis.forEach((doc, index) => {
      prompt += `\n### Document ${index + 1} (${doc.file_type})\n`;
      prompt += `Analysis: ${doc.analysis}\n`;
      if (doc.key_points.length > 0) {
        prompt += `Key Points:\n${doc.key_points.map(p => `- ${p}`).join('\n')}\n`;
      }
      if (doc.red_flags.length > 0) {
        prompt += `Red Flags:\n${doc.red_flags.map(f => `- ${f}`).join('\n')}\n`;
      }
    });
  }

  // Add instructions for the analysis
  prompt += `

# YOUR TASK

Generate a comprehensive investigation report in JSON format with the following structure:

{
  "legitimacy_score": 1-10,
  "confidence_level": 0-1,
  "recommendation": "TRUST|PROCEED_WITH_CAUTION|AVOID|HIGH_RISK_SCAM",
  "executive_summary": "3-4 sentence overview of findings",
  "red_flags": [
    {
      "flag": "Description of the red flag",
      "severity": "critical|high|medium|low",
      "evidence": "Specific data supporting this flag",
      "impact": "What this means for the user"
    }
  ],
  "legitimacy_indicators": [
    {
      "indicator": "Positive sign of legitimacy",
      "strength": "strong|moderate|weak",
      "evidence": "Supporting data"
    }
  ],
  "risk_breakdown": {
    "financial": {
      "level": "critical|high|medium|low",
      "description": "Assessment of financial risk"
    },
    "privacy": {
      "level": "critical|high|medium|low",
      "description": "Assessment of privacy/data risk"
    },
    "reputation": {
      "level": "critical|high|medium|low",
      "description": "Assessment of reputational risk"
    },
    "legal": {
      "level": "critical|high|medium|low",
      "description": "Assessment of legal risk"
    }
  },
  "business_intelligence": {
    "business_model": "How they operate",
    "revenue_sources": "How they make money",
    "target_market": "Who they target",
    "competitive_position": "Market position",
    "company_size": "Size estimate",
    "funding_info": "Funding details if known"
  },
  "evidence_sources": [
    {
      "source": "Source name",
      "url": "URL",
      "key_findings": ["Finding 1", "Finding 2"],
      "reliability": "high|medium|low"
    }
  ],
  "key_findings": ["Most important discovery 1", "Discovery 2", "..."],
  "recommendations": {
    "for_user": ["Specific advice 1", "Advice 2", "..."],
    "next_steps": ["Action 1", "Action 2", "..."]
  }
}

## SCORING GUIDELINES

**Legitimacy Score (1-10):**
- 9-10: Highly legitimate, well-established, positive reputation
- 7-8: Generally legitimate with minor concerns
- 5-6: Mixed signals, requires caution
- 3-4: Multiple red flags, likely problematic
- 1-2: High risk scam, avoid completely

**Confidence Level (0-1):**
- 0.9-1.0: Very high confidence based on extensive evidence
- 0.7-0.89: High confidence with solid evidence
- 0.5-0.69: Moderate confidence, some uncertainty
- Below 0.5: Low confidence, insufficient data

**Recommendation:**
- TRUST: Safe to proceed with normal precautions
- PROCEED_WITH_CAUTION: Legitimate but has concerns worth noting
- AVOID: Multiple red flags, do not recommend
- HIGH_RISK_SCAM: Clear scam indicators, warn user strongly

## ANALYSIS REQUIREMENTS

1. **Be Evidence-Based**: Every claim must be supported by specific evidence
2. **Be Balanced**: Include both positive and negative findings
3. **Be Specific**: Avoid vague statements, provide concrete details
4. **Be Actionable**: Recommendations should be clear and practical
5. **Cite Sources**: Reference specific sources for key findings
6. **Identify Patterns**: Look for patterns across multiple data sources
7. **Consider Context**: Factor in industry norms and expectations

Provide ONLY the JSON response, no additional text.
`;

  return prompt;
}

/**
 * Validate and ensure analysis has all required fields
 */
function validateAnalysis(analysis: Partial<AnalysisResult>): AnalysisResult {
  return {
    legitimacy_score: analysis.legitimacy_score || 5,
    confidence_level: analysis.confidence_level || 0.5,
    recommendation: analysis.recommendation || 'PROCEED_WITH_CAUTION',
    executive_summary: analysis.executive_summary || 'Analysis completed.',
    red_flags: analysis.red_flags || [],
    legitimacy_indicators: analysis.legitimacy_indicators || [],
    risk_breakdown: analysis.risk_breakdown || {
      financial: { level: 'medium', description: 'Unknown' },
      privacy: { level: 'medium', description: 'Unknown' },
      reputation: { level: 'medium', description: 'Unknown' },
      legal: { level: 'medium', description: 'Unknown' },
    },
    business_intelligence: analysis.business_intelligence || {},
    evidence_sources: analysis.evidence_sources || [],
    key_findings: analysis.key_findings || [],
    recommendations: analysis.recommendations || {
      for_user: [],
      next_steps: [],
    },
  };
}

/**
 * Calculate a simple legitimacy score based on indicators
 */
export function calculateLegitimacyScore(data: {
  positive_indicators: number;
  red_flags: number;
  critical_flags: number;
}): number {
  let score = 5; // Start neutral

  // Add points for positive indicators
  score += Math.min(data.positive_indicators * 0.5, 3);

  // Subtract for red flags
  score -= data.red_flags * 0.5;

  // Heavily penalize critical flags
  score -= data.critical_flags * 2;

  // Clamp between 1-10
  return Math.max(1, Math.min(10, Math.round(score)));
}
