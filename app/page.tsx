'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Shield, FileText, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [targetName, setTargetName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [email, setEmail] = useState('');

  const handleQuickInvestigation = async () => {
    if (!targetName.trim()) {
      alert('Please enter a company name, website, or entity to investigate');
      return;
    }

    setLoading(true);

    try {
      // Create investigation
      const response = await fetch('/api/investigations/quick-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_name: targetName,
          target_url: targetUrl || undefined,
          client_email: email || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create investigation');
      }

      // Redirect to investigation page
      router.push(`/investigate/${data.investigationId}`);
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">InvestigatorAI</h1>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            Powered by Claude AI
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4">
            AI-Powered Investigation Platform
          </Badge>

          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Investigate Anyone or Anything with AI
          </h2>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Get comprehensive fraud detection, legitimacy scoring, and risk assessment
            for companies, influencers, apps, and websites in minutes.
          </p>

          {/* Quick Investigation Form */}
          <Card className="max-w-2xl mx-auto shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Start Free Investigation</CardTitle>
              <CardDescription>
                Enter details below and our AI will conduct comprehensive research
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  placeholder="Company name, website, or entity to investigate *"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="text-lg h-12"
                  disabled={loading}
                />
              </div>

              <div>
                <Input
                  placeholder="Website URL (optional)"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="h-12"
                  disabled={loading}
                />
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="Your email for report delivery (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  disabled={loading}
                />
              </div>

              <Button
                size="lg"
                className="w-full h-14 text-lg"
                onClick={handleQuickInvestigation}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Zap className="mr-2 h-5 w-5 animate-pulse" />
                    Creating Investigation...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Start AI Investigation
                  </>
                )}
              </Button>

              <p className="text-sm text-gray-500 text-center">
                No signup required • Results in 2-5 minutes
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 bg-white/50">
        <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <Search className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>1. AI Web Research</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our AI conducts multi-source internet research, analyzing reviews,
                complaints, social media, and public records.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <AlertTriangle className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>2. Fraud Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Advanced pattern recognition identifies red flags, scam indicators,
                and legitimacy signals across multiple data points.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>3. Detailed Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Receive a comprehensive PDF report with legitimacy score, risk assessment,
                and actionable recommendations.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What We Analyze */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">What We Can Investigate</h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <CheckCircle className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Companies</h4>
              <p className="text-sm text-gray-600">Business legitimacy, registration, financial health</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <CheckCircle className="h-10 w-10 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Influencers</h4>
              <p className="text-sm text-gray-600">Authenticity, fake followers, scam promotions</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Mobile Apps</h4>
              <p className="text-sm text-gray-600">Security, hidden fees, subscription traps</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <CheckCircle className="h-10 w-10 text-orange-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Websites</h4>
              <p className="text-sm text-gray-600">Scam detection, trust indicators, safety</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2025 InvestigatorAI. Powered by Anthropic Claude & Supabase.</p>
          <p className="text-sm mt-2">AI-Powered Fraud Detection & Legitimacy Verification</p>
        </div>
      </footer>
    </div>
  );
}
