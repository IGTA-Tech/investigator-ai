'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  FileText,
  ExternalLink,
  Loader2,
} from 'lucide-react';

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [investigation, setInvestigation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [resolvedParams.id]);

  const loadResults = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data, error } = await supabase
        .from('investigations')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (error) throw error;
      setInvestigation(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load results:', error);
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'TRUST':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'PROCEED_WITH_CAUTION':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'AVOID':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'HIGH_RISK_SCAM':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-orange-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!investigation || investigation.status !== 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Results Not Available</CardTitle>
            <CardDescription>
              {investigation?.status === 'processing'
                ? 'Investigation is still in progress...'
                : 'Investigation not found or incomplete.'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Investigation Report</h1>
          <p className="text-xl text-gray-600">{investigation.target_name}</p>
          {investigation.target_url && (
            <a
              href={investigation.target_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-1 mt-2"
            >
              {investigation.target_url}
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        {/* Verdict Card */}
        <Card className="mb-8 border-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">Verdict</CardTitle>
                <CardDescription className="text-base">
                  Based on comprehensive AI analysis
                </CardDescription>
              </div>
              {investigation.report_url && (
                <Button size="lg" asChild>
                  <a href={investigation.report_url} download>
                    <Download className="mr-2 h-5 w-5" />
                    Download PDF
                  </a>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Legitimacy Score</p>
                <div className={`text-6xl font-bold ${getScoreColor(investigation.legitimacy_score)}`}>
                  {investigation.legitimacy_score}/10
                </div>
                <Progress
                  value={investigation.legitimacy_score * 10}
                  className="mt-4 h-3"
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm text-gray-600 mb-2">Recommendation</p>
                <Badge className={`text-xl py-3 px-6 border-2 ${getRecommendationColor(investigation.recommendation)}`}>
                  {investigation.recommendation.replace(/_/g, ' ')}
                </Badge>
                <p className="text-sm text-gray-600 mt-4">
                  Confidence: {Math.round(investigation.confidence_level * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Executive Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{investigation.executive_summary}</p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="findings" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="findings">Key Findings</TabsTrigger>
            <TabsTrigger value="red-flags">Red Flags</TabsTrigger>
            <TabsTrigger value="legitimacy">Legitimacy</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          </TabsList>

          <TabsContent value="findings">
            <Card>
              <CardHeader>
                <CardTitle>Key Findings</CardTitle>
              </CardHeader>
              <CardContent>
                {investigation.key_findings && investigation.key_findings.length > 0 ? (
                  <ul className="space-y-3">
                    {investigation.key_findings.map((finding: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No key findings available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="red-flags">
            <Card>
              <CardHeader>
                <CardTitle>Red Flags Identified</CardTitle>
              </CardHeader>
              <CardContent>
                {investigation.red_flags && investigation.red_flags.length > 0 ? (
                  <div className="space-y-6">
                    {investigation.red_flags.map((flag: any, index: number) => (
                      <div key={index} className="border-l-4 border-red-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <h4 className="font-semibold">{flag.flag}</h4>
                          <Badge variant="destructive">{flag.severity}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Evidence:</strong> {flag.evidence}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Impact:</strong> {flag.impact}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <p className="text-gray-600">No significant red flags identified</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legitimacy">
            <Card>
              <CardHeader>
                <CardTitle>Legitimacy Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                {investigation.legitimacy_indicators && investigation.legitimacy_indicators.length > 0 ? (
                  <div className="space-y-4">
                    {investigation.legitimacy_indicators.map((indicator: any, index: number) => (
                      <div key={index} className="border-l-4 border-green-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <h4 className="font-semibold">{indicator.indicator}</h4>
                          <Badge variant="outline">{indicator.strength}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{indicator.evidence}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No legitimacy indicators found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk">
            <Card>
              <CardHeader>
                <CardTitle>Risk Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {investigation.risk_breakdown && (
                  <div className="space-y-6">
                    {Object.entries(investigation.risk_breakdown).map(([category, risk]: [string, any]) => (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold capitalize">{category} Risk</h4>
                          <Badge className={getRiskColor(risk.level)}>
                            {risk.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{risk.description}</p>
                        <Separator className="mt-4" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recommendations */}
        {investigation.recommendations && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-3 text-blue-600">For You</h4>
                  <ul className="space-y-2">
                    {investigation.recommendations.for_user?.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-purple-600">Next Steps</h4>
                  <ul className="space-y-2">
                    {investigation.recommendations.next_steps?.map((step: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Download Button */}
        {investigation.report_url && (
          <div className="text-center">
            <Button size="lg" asChild>
              <a href={investigation.report_url} download>
                <Download className="mr-2 h-5 w-5" />
                Download Full PDF Report
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
