import { createMessage, extractTextContent } from './claude';
import Anthropic from '@anthropic-ai/sdk';

export interface DocumentAnalysis {
  file_url: string;
  file_type: string;
  analysis: string;
  key_points: string[];
  red_flags: string[];
  extracted_data: Record<string, any>;
}

/**
 * Analyze uploaded documents (PDFs, images, etc.)
 */
export async function analyzeUploadedContent(
  fileUrls: string[]
): Promise<DocumentAnalysis[]> {
  const analyses: DocumentAnalysis[] = [];

  for (const url of fileUrls) {
    try {
      const analysis = await analyzeDocument(url);
      analyses.push(analysis);
    } catch (error) {
      console.error(`Failed to analyze ${url}:`, error);
      // Continue with other documents
    }
  }

  return analyses;
}

/**
 * Detect actual image format from base64 data
 */
function detectImageFormat(base64Data: string): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
  // Check magic bytes (first few bytes of base64 decoded data)
  const header = base64Data.substring(0, 16);

  if (header.startsWith('/9j/')) return 'image/jpeg'; // JPEG
  if (header.startsWith('iVBORw0KGgo')) return 'image/png'; // PNG
  if (header.startsWith('R0lGOD')) return 'image/gif'; // GIF
  if (header.startsWith('UklGR')) return 'image/webp'; // WebP

  // Default to JPEG if can't detect
  return 'image/jpeg';
}

/**
 * Normalize media type for Claude API
 */
function normalizeMediaType(contentType: string, base64Data: string): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' | 'application/pdf' {
  if (contentType.includes('pdf')) {
    return 'application/pdf';
  }

  if (contentType.includes('image')) {
    // Detect actual format from base64 data
    return detectImageFormat(base64Data);
  }

  // Default to JPEG
  return 'image/jpeg';
}

/**
 * Analyze a single document
 */
async function analyzeDocument(fileUrl: string): Promise<DocumentAnalysis> {
  // Fetch the document
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch document: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  // Normalize media type to match actual content
  const normalizedMediaType = normalizeMediaType(contentType, base64);

  let analysisText: string;
  let messageContent: Anthropic.MessageParam['content'];

  // Determine document type and create appropriate message
  if (normalizedMediaType.startsWith('image/')) {
    // Image analysis
    messageContent = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: normalizedMediaType,
          data: base64,
        },
      },
      {
        type: 'text',
        text: `Analyze this image for investigation purposes.

Identify:
1. What is shown in the image
2. Any suspicious elements or red flags
3. Text content (if any)
4. Authenticity indicators
5. Any manipulated or edited areas
6. Relevant details for fraud detection

Provide a detailed analysis.`,
      },
    ];
  } else if (contentType.includes('pdf')) {
    // PDF analysis
    messageContent = [
      {
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: base64,
        },
      },
      {
        type: 'text',
        text: `Analyze this PDF document for investigation purposes.

Extract and analyze:
1. Document type and purpose
2. Key information and data points
3. Red flags or suspicious elements
4. Authenticity indicators
5. Relevant contact information
6. Financial information (if any)
7. Legal disclaimers or fine print

Provide a comprehensive analysis with specific details.`,
      },
    ];
  } else {
    throw new Error(`Unsupported file type: ${contentType}`);
  }

  const result = await createMessage({
    messages: [{ role: 'user', content: messageContent }],
    max_tokens: 4096,
  });

  if (!result.success) {
    throw new Error(`Analysis failed: ${result.error}`);
  }

  analysisText = extractTextContent(result.data!);

  // Extract key points and red flags
  const keyPoints = await extractKeyPoints(analysisText);
  const redFlags = await extractRedFlags(analysisText);
  const extractedData = await extractStructuredData(analysisText);

  return {
    file_url: fileUrl,
    file_type: contentType,
    analysis: analysisText,
    key_points: keyPoints,
    red_flags: redFlags,
    extracted_data: extractedData,
  };
}

/**
 * Extract key points from analysis text
 */
async function extractKeyPoints(analysisText: string): Promise<string[]> {
  const response = await createMessage({
    messages: [
      {
        role: 'user',
        content: `From this document analysis, extract 3-5 key points as a bullet list:

${analysisText}

Provide ONLY the bullet points, one per line, starting with a dash (-).`,
      },
    ],
    max_tokens: 512,
  });

  if (!response.success) return [];

  const text = extractTextContent(response.data!);
  return text
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.trim().substring(1).trim());
}

/**
 * Extract red flags from analysis
 */
async function extractRedFlags(analysisText: string): Promise<string[]> {
  const response = await createMessage({
    messages: [
      {
        role: 'user',
        content: `From this document analysis, identify any red flags or suspicious elements as a bullet list:

${analysisText}

Provide ONLY the red flags as bullet points, one per line, starting with a dash (-). If no red flags, respond with "None identified".`,
      },
    ],
    max_tokens: 512,
  });

  if (!response.success) return [];

  const text = extractTextContent(response.data!);
  if (text.toLowerCase().includes('none identified')) return [];

  return text
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.trim().substring(1).trim());
}

/**
 * Extract structured data from analysis
 */
async function extractStructuredData(
  analysisText: string
): Promise<Record<string, any>> {
  const response = await createMessage({
    messages: [
      {
        role: 'user',
        content: `From this document analysis, extract structured data in JSON format:

${analysisText}

Extract any relevant:
- Company names
- Email addresses
- Phone numbers
- Addresses
- URLs
- Dates
- Financial figures
- Names of people

Return ONLY valid JSON. If no data found, return {}.`,
      },
    ],
    max_tokens: 1024,
  });

  if (!response.success) return {};

  const text = extractTextContent(response.data!);
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to parse extracted data:', error);
  }

  return {};
}

/**
 * Analyze image specifically for screenshot investigation
 */
export async function analyzeScreenshot(imageUrl: string): Promise<DocumentAnalysis> {
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const contentType = response.headers.get('content-type') || 'image/png';

  // Detect actual image format
  const normalizedMediaType = detectImageFormat(base64);

  const result = await createMessage({
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: normalizedMediaType,
              data: base64,
            },
          },
          {
            type: 'text',
            text: `Analyze this screenshot for potential scam indicators.

Look for:
1. Website design quality and professionalism
2. Grammar and spelling errors
3. Unrealistic promises or claims
4. Urgency tactics or pressure
5. Contact information legitimacy
6. Trust badges or certifications (are they real?)
7. Payment methods offered
8. Red flags in the visual design

Provide a detailed scam risk assessment.`,
          },
        ],
      },
    ],
    max_tokens: 2048,
  });

  const analysisText = result.success ? extractTextContent(result.data!) : 'Analysis failed';

  const keyPoints = await extractKeyPoints(analysisText);
  const redFlags = await extractRedFlags(analysisText);

  return {
    file_url: imageUrl,
    file_type: contentType,
    analysis: analysisText,
    key_points: keyPoints,
    red_flags: redFlags,
    extracted_data: {},
  };
}
