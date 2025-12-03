import { createMessage, extractTextContent } from './claude';

export interface WebSearchResult {
  query: string;
  results: string;
  sources: string[];
}

export interface ResearchData {
  searches: WebSearchResult[];
  summary: string;
  key_findings: string[];
}

/**
 * Conduct comprehensive web research on a target
 */
export async function conductWebResearch(
  targetName: string,
  targetUrl?: string
): Promise<ResearchData> {
  // Generate search queries
  const searchQueries = generateSearchQueries(targetName, targetUrl);

  const searches: WebSearchResult[] = [];
  const allSources: string[] = [];

  // Perform each search
  for (const query of searchQueries) {
    const result = await performSearch(query);
    searches.push(result);
    allSources.push(...result.sources);
  }

  // Generate comprehensive summary
  const summary = await generateResearchSummary(targetName, searches);

  // Extract key findings
  const keyFindings = await extractKeyFindings(searches);

  return {
    searches,
    summary,
    key_findings: keyFindings,
  };
}

/**
 * Generate relevant search queries for the target
 */
function generateSearchQueries(targetName: string, targetUrl?: string): string[] {
  const queries: string[] = [
    `${targetName} reviews`,
    `${targetName} scam complaints`,
    `${targetName} legitimacy`,
    `${targetName} BBB rating`,
    `${targetName} trustpilot reviews`,
    `${targetName} reddit reviews`,
    `${targetName} customer complaints`,
  ];

  // Add domain-specific searches if URL provided
  if (targetUrl) {
    try {
      const domain = new URL(targetUrl).hostname;
      queries.push(
        `site:${domain}`,
        `${domain} scam`,
        `${domain} safe`,
        `whois ${domain}`
      );
    } catch (error) {
      console.error('Invalid URL:', error);
    }
  }

  return queries;
}

/**
 * Perform a single web search using Claude
 */
async function performSearch(query: string): Promise<WebSearchResult> {
  const response = await createMessage({
    messages: [
      {
        role: 'user',
        content: `Search the web for: "${query}"

Provide comprehensive information including:
- Overview of findings
- Credibility indicators (positive or negative)
- Specific examples and evidence
- Source URLs where information was found

Format your response clearly with sources cited.`,
      },
    ],
    max_tokens: 4096,
  });

  const results = response.success ? extractTextContent(response.data!) : 'Search failed';

  // Extract URLs from the results
  const urlRegex = /https?:\/\/[^\s]+/g;
  const sources = results.match(urlRegex) || [];

  return {
    query,
    results,
    sources: [...new Set(sources)], // Remove duplicates
  };
}

/**
 * Generate a comprehensive summary from all search results
 */
async function generateResearchSummary(
  targetName: string,
  searches: WebSearchResult[]
): Promise<string> {
  const combinedResults = searches
    .map(s => `Query: ${s.query}\nResults: ${s.results}`)
    .join('\n\n---\n\n');

  const response = await createMessage({
    messages: [
      {
        role: 'user',
        content: `Based on the following web research about "${targetName}", provide a comprehensive 3-4 paragraph summary:

${combinedResults}

Focus on:
1. Overall legitimacy assessment
2. Key red flags or positive indicators
3. Consensus from multiple sources
4. Any conflicting information`,
      },
    ],
    max_tokens: 2048,
  });

  return response.success ? extractTextContent(response.data!) : 'Summary generation failed';
}

/**
 * Extract key findings from search results
 */
async function extractKeyFindings(searches: WebSearchResult[]): Promise<string[]> {
  const combinedResults = searches.map(s => s.results).join('\n\n');

  const response = await createMessage({
    messages: [
      {
        role: 'user',
        content: `From the following research results, extract 5-10 key findings as a bullet-point list. Each finding should be a concise, specific fact or observation.

${combinedResults}

Provide ONLY the bullet points, one per line, starting with a dash (-).`,
      },
    ],
    max_tokens: 1024,
  });

  if (!response.success) return [];

  const text = extractTextContent(response.data!);
  return text
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.trim().substring(1).trim());
}
