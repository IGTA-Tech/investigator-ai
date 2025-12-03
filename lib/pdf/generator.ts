import type { Investigation, AnalysisResult } from '@/types/investigation';
import jsPDF from 'jspdf';

export interface ReportOptions {
  includeSources?: boolean;
  includeRawData?: boolean;
  format?: 'letter' | 'a4';
}

/**
 * Generate a comprehensive PDF investigation report
 */
export async function generatePDFReport(
  investigation: Investigation,
  analysis: AnalysisResult,
  options: ReportOptions = {}
): Promise<Blob> {
  const {
    includeSources = true,
    includeRawData = false,
    format = 'letter',
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: format,
  });

  let yPos = 20; // Starting Y position

  // === HEADER ===
  doc.setFillColor(30, 58, 138); // Blue header
  doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('INVESTIGATION REPORT', 20, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report ID: ${investigation.id.substring(0, 8)}`, 20, 30);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 36);

  yPos = 55;

  // === TARGET INFORMATION ===
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TARGET INFORMATION', 20, yPos);

  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  doc.text(`Name: ${investigation.target_name}`, 25, yPos);
  yPos += 7;

  if (investigation.target_type) {
    doc.text(`Type: ${investigation.target_type}`, 25, yPos);
    yPos += 7;
  }

  if (investigation.target_url) {
    doc.text(`URL: ${investigation.target_url}`, 25, yPos);
    yPos += 7;
  }

  yPos += 5;

  // === VERDICT BOX ===
  const verdictColor = getRecommendationColor(analysis.recommendation);
  doc.setFillColor(...verdictColor);
  doc.roundedRect(20, yPos, 170, 35, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('VERDICT', 25, yPos + 10);

  doc.setFontSize(14);
  doc.text(
    `Legitimacy Score: ${analysis.legitimacy_score}/10`,
    25,
    yPos + 20
  );
  doc.text(
    `Recommendation: ${analysis.recommendation.replace(/_/g, ' ')}`,
    25,
    yPos + 28
  );

  yPos += 45;

  // === EXECUTIVE SUMMARY ===
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE SUMMARY', 20, yPos);

  yPos += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const summaryLines = doc.splitTextToSize(analysis.executive_summary, 170);
  doc.text(summaryLines, 20, yPos);
  yPos += summaryLines.length * 5 + 10;

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // === KEY FINDINGS ===
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('KEY FINDINGS', 20, yPos);

  yPos += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  analysis.key_findings.forEach((finding, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    const findingText = `${index + 1}. ${finding}`;
    const lines = doc.splitTextToSize(findingText, 165);
    doc.text(lines, 25, yPos);
    yPos += lines.length * 5 + 3;
  });

  yPos += 5;

  // === RED FLAGS ===
  if (analysis.red_flags.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38); // Red
    doc.text('RED FLAGS', 20, yPos);

    yPos += 8;

    analysis.red_flags.forEach((flag, index) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      // Flag title with severity
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const severityColor = getSeverityColor(flag.severity);
      doc.setTextColor(...severityColor);
      doc.text(`${index + 1}. ${flag.flag} [${flag.severity.toUpperCase()}]`, 25, yPos);

      yPos += 6;

      // Evidence
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Evidence:', 30, yPos);
      yPos += 5;

      const evidenceLines = doc.splitTextToSize(flag.evidence, 155);
      doc.text(evidenceLines, 30, yPos);
      yPos += evidenceLines.length * 4;

      // Impact
      yPos += 2;
      doc.text('Impact:', 30, yPos);
      yPos += 5;

      const impactLines = doc.splitTextToSize(flag.impact, 155);
      doc.text(impactLines, 30, yPos);
      yPos += impactLines.length * 4 + 5;
    });

    yPos += 5;
  }

  // === LEGITIMACY INDICATORS ===
  if (analysis.legitimacy_indicators.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94); // Green
    doc.text('LEGITIMACY INDICATORS', 20, yPos);

    yPos += 8;

    analysis.legitimacy_indicators.forEach((indicator, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(
        `${index + 1}. ${indicator.indicator} (${indicator.strength})`,
        25,
        yPos
      );

      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const evidenceLines = doc.splitTextToSize(indicator.evidence, 160);
      doc.text(evidenceLines, 30, yPos);
      yPos += evidenceLines.length * 4 + 5;
    });

    yPos += 5;
  }

  // === RISK BREAKDOWN ===
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('RISK ASSESSMENT', 20, yPos);

  yPos += 10;

  const riskCategories = [
    { name: 'Financial Risk', data: analysis.risk_breakdown.financial },
    { name: 'Privacy Risk', data: analysis.risk_breakdown.privacy },
    { name: 'Reputation Risk', data: analysis.risk_breakdown.reputation },
    { name: 'Legal Risk', data: analysis.risk_breakdown.legal },
  ];

  riskCategories.forEach(category => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    // Risk level badge
    const levelColor = getRiskLevelColor(category.data.level);
    doc.setFillColor(...levelColor);
    doc.roundedRect(25, yPos - 4, 40, 7, 1, 1, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(category.data.level.toUpperCase(), 27, yPos);

    // Category name
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(category.name, 70, yPos);

    yPos += 6;

    // Description
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(category.data.description, 160);
    doc.text(descLines, 25, yPos);
    yPos += descLines.length * 4 + 6;
  });

  // === RECOMMENDATIONS ===
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RECOMMENDATIONS', 20, yPos);

  yPos += 10;

  doc.setFontSize(12);
  doc.text('For User:', 25, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  analysis.recommendations.for_user.forEach((rec, index) => {
    if (yPos > 275) {
      doc.addPage();
      yPos = 20;
    }

    const recText = `${index + 1}. ${rec}`;
    const lines = doc.splitTextToSize(recText, 160);
    doc.text(lines, 30, yPos);
    yPos += lines.length * 4 + 3;
  });

  yPos += 5;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Next Steps:', 25, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  analysis.recommendations.next_steps.forEach((step, index) => {
    if (yPos > 275) {
      doc.addPage();
      yPos = 20;
    }

    const stepText = `${index + 1}. ${step}`;
    const lines = doc.splitTextToSize(stepText, 160);
    doc.text(lines, 30, yPos);
    yPos += lines.length * 4 + 3;
  });

  // === SOURCES (if enabled) ===
  if (includeSources && analysis.evidence_sources.length > 0) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('EVIDENCE SOURCES', 20, yPos);

    yPos += 10;

    analysis.evidence_sources.forEach((source, index) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${source.source}`, 25, yPos);

      yPos += 5;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(source.url, 30, yPos);
      yPos += 5;

      doc.setTextColor(0, 0, 0);
      source.key_findings.forEach(finding => {
        const lines = doc.splitTextToSize(`• ${finding}`, 155);
        doc.text(lines, 30, yPos);
        yPos += lines.length * 4 + 2;
      });

      yPos += 4;
    });
  }

  // === FOOTER ON EVERY PAGE ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, doc.internal.pageSize.height - 15, 190, doc.internal.pageSize.height - 15);

    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'This report is confidential. Generated by InvestigatorAI',
      20,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
  }

  return doc.output('blob');
}

/**
 * Get color for recommendation badge
 */
function getRecommendationColor(recommendation: string): [number, number, number] {
  switch (recommendation) {
    case 'TRUST':
      return [34, 197, 94]; // Green
    case 'PROCEED_WITH_CAUTION':
      return [234, 179, 8]; // Yellow
    case 'AVOID':
      return [249, 115, 22]; // Orange
    case 'HIGH_RISK_SCAM':
      return [220, 38, 38]; // Red
    default:
      return [107, 114, 128]; // Gray
  }
}

/**
 * Get color for severity level
 */
function getSeverityColor(severity: string): [number, number, number] {
  switch (severity) {
    case 'critical':
      return [153, 27, 27]; // Dark red
    case 'high':
      return [220, 38, 38]; // Red
    case 'medium':
      return [249, 115, 22]; // Orange
    case 'low':
      return [234, 179, 8]; // Yellow
    default:
      return [107, 114, 128]; // Gray
  }
}

/**
 * Get color for risk level
 */
function getRiskLevelColor(level: string): [number, number, number] {
  switch (level) {
    case 'critical':
      return [153, 27, 27]; // Dark red
    case 'high':
      return [220, 38, 38]; // Red
    case 'medium':
      return [234, 179, 8]; // Yellow
    case 'low':
      return [34, 197, 94]; // Green
    default:
      return [107, 114, 128]; // Gray
  }
}
