import { createClient } from '@supabase/supabase-js';
import { conductWebResearch } from './web-research';
import { analyzeUploadedContent } from './analyze-document';
import { generateComprehensiveAnalysis } from './generate-analysis';
import { generatePDFReport } from '../pdf/generator';
import type { Investigation, AnalysisResult } from '@/types/investigation';

// Server-side Supabase client with service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Main investigation orchestrator
 * Conducts a complete investigation from start to finish
 */
export async function conductInvestigation(investigationId: string): Promise<AnalysisResult> {
  try {
    // 1. Fetch investigation data
    const { data: investigation, error: fetchError } = await supabaseAdmin
      .from('investigations')
      .select('*')
      .eq('id', investigationId)
      .single();

    if (fetchError || !investigation) {
      throw new Error(`Failed to fetch investigation: ${fetchError?.message}`);
    }

    // Update status to processing
    await updateInvestigationStatus(investigationId, 'processing');

    // 2. Conduct web research if target URL or name provided
    let research = null;
    if (investigation.target_name) {
      console.log(`🔍 Starting web research for: ${investigation.target_name}`);
      research = await conductWebResearch(
        investigation.target_name,
        investigation.target_url || undefined
      );
    }

    // 3. Analyze uploaded documents/images if provided
    let documentAnalysis = null;
    if (investigation.uploaded_files && investigation.uploaded_files.length > 0) {
      console.log(`📄 Analyzing ${investigation.uploaded_files.length} uploaded files`);
      documentAnalysis = await analyzeUploadedContent(investigation.uploaded_files);
    }

    // 4. Generate comprehensive analysis
    console.log('🤖 Generating comprehensive analysis');
    const analysis = await generateComprehensiveAnalysis({
      target_name: investigation.target_name,
      target_type: investigation.target_type || undefined,
      target_url: investigation.target_url || undefined,
      form_responses: investigation.form_responses || undefined,
      pasted_content: investigation.pasted_content || undefined,
      submitted_urls: investigation.submitted_urls || undefined,
      research: research || undefined,
      document_analysis: documentAnalysis || undefined,
    });

    // 5. Save analysis results to database
    console.log('💾 Saving analysis results');
    const { error: updateError } = await supabaseAdmin
      .from('investigations')
      .update({
        status: 'completed',
        legitimacy_score: analysis.legitimacy_score,
        confidence_level: analysis.confidence_level,
        recommendation: analysis.recommendation,
        executive_summary: analysis.executive_summary,
        red_flags: analysis.red_flags,
        legitimacy_indicators: analysis.legitimacy_indicators,
        risk_breakdown: analysis.risk_breakdown,
        business_intelligence: analysis.business_intelligence,
        evidence_sources: analysis.evidence_sources,
        key_findings: analysis.key_findings,
        raw_research_data: {
          research,
          document_analysis: documentAnalysis,
        },
        completed_at: new Date().toISOString(),
      })
      .eq('id', investigationId);

    if (updateError) {
      console.error('Failed to save analysis:', updateError);
      throw new Error(`Failed to save analysis: ${updateError.message}`);
    }

    // 6. Generate PDF report
    console.log('📑 Generating PDF report');
    const pdfBlob = await generatePDFReport(investigation, analysis);

    // 7. Upload PDF to Supabase Storage
    const fileName = `report-${investigationId}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('reports')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Failed to upload PDF:', uploadError);
    } else {
      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('reports')
        .getPublicUrl(fileName);

      // Update investigation with report URL
      await supabaseAdmin
        .from('investigations')
        .update({ report_url: urlData.publicUrl })
        .eq('id', investigationId);
    }

    // 8. Send email notification if client email provided
    if (investigation.client_email) {
      console.log('📧 Sending email notification');
      try {
        const { sendReportEmail } = await import('../email/sendgrid');
        const { data: urlData } = supabaseAdmin.storage
          .from('reports')
          .getPublicUrl(fileName);

        await sendReportEmail({
          recipient: investigation.client_email,
          targetName: investigation.target_name,
          legitimacyScore: analysis.legitimacy_score,
          recommendation: analysis.recommendation,
          reportUrl: urlData.publicUrl,
          executiveSummary: analysis.executive_summary,
        });

        // Log email sent
        await supabaseAdmin.from('email_logs').insert({
          investigation_id: investigationId,
          email_type: 'report_complete',
          recipient: investigation.client_email,
          status: 'sent',
        });

        console.log('✅ Email sent successfully');
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the investigation if email fails
      }
    }

    console.log('✅ Investigation completed successfully');
    return analysis;
  } catch (error: any) {
    console.error('❌ Investigation failed:', error);

    // Mark investigation as failed
    await updateInvestigationStatus(investigationId, 'failed');

    throw error;
  }
}

/**
 * Update investigation status
 */
async function updateInvestigationStatus(
  investigationId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed'
): Promise<void> {
  await supabaseAdmin
    .from('investigations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', investigationId);
}

/**
 * Create a new investigation
 */
export async function createInvestigation(data: {
  created_by: string;
  target_name: string;
  target_type?: string;
  target_url?: string;
  investigation_mode: 'form' | 'portal';
  form_id?: string;
  client_email?: string;
  client_name?: string;
}): Promise<string> {
  const { data: investigation, error } = await supabaseAdmin
    .from('investigations')
    .insert({
      created_by: data.created_by,
      target_name: data.target_name,
      target_type: data.target_type,
      target_url: data.target_url,
      investigation_mode: data.investigation_mode,
      form_id: data.form_id,
      client_email: data.client_email,
      client_name: data.client_name,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create investigation: ${error.message}`);
  }

  return investigation.id;
}

/**
 * Submit form responses and trigger investigation
 */
export async function submitFormResponse(
  investigationId: string,
  responses: Record<string, any>
): Promise<void> {
  // Save form responses
  const { error } = await supabaseAdmin
    .from('investigations')
    .update({
      form_responses: responses,
      status: 'pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', investigationId);

  if (error) {
    throw new Error(`Failed to submit form response: ${error.message}`);
  }

  // Trigger investigation (can be done async)
  conductInvestigation(investigationId).catch(err => {
    console.error('Investigation failed:', err);
  });
}

/**
 * Submit portal content (files, text, URLs) and trigger investigation
 */
export async function submitPortalContent(
  investigationId: string,
  content: {
    uploaded_files?: string[];
    pasted_content?: string;
    submitted_urls?: string[];
  }
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('investigations')
    .update({
      uploaded_files: content.uploaded_files || [],
      pasted_content: content.pasted_content,
      submitted_urls: content.submitted_urls || [],
      status: 'pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', investigationId);

  if (error) {
    throw new Error(`Failed to submit portal content: ${error.message}`);
  }

  // Trigger investigation
  conductInvestigation(investigationId).catch(err => {
    console.error('Investigation failed:', err);
  });
}
