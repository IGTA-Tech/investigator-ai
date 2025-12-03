'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Link as LinkIcon, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function InvestigatePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [investigation, setInvestigation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // User inputs
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; size: number }[]>([]);
  const [pastedContent, setPastedContent] = useState('');
  const [urls, setUrls] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    loadInvestigation();
    // Poll for status updates
    const interval = setInterval(loadInvestigation, 3000);
    return () => clearInterval(interval);
  }, [resolvedParams.id]);

  const loadInvestigation = async () => {
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

      // If completed, redirect to results
      if (data.status === 'completed') {
        router.push(`/results/${resolvedParams.id}`);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load investigation:', error);
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => formData.append('files', file));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      const newFiles = data.files.map((f: any, idx: number) => ({
        name: files[idx].name,
        url: f.url,
        size: files[idx].size
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const addUrl = () => {
    if (!currentUrl.trim()) return;

    try {
      new URL(currentUrl); // Validate URL
      setUrls([...urls, currentUrl.trim()]);
      setCurrentUrl('');
      toast.success('URL added');
    } catch {
      toast.error('Invalid URL');
    }
  };

  const removeUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const submitInvestigation = async () => {
    if (uploadedFiles.length === 0 && !pastedContent.trim() && urls.length === 0) {
      toast.error('Please provide at least some information to investigate');
      return;
    }

    setSubmitting(true);

    try {
      // Update investigation with content
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('investigations')
        .update({
          uploaded_files: uploadedFiles.map(f => f.url),
          pasted_content: pastedContent.trim() || null,
          submitted_urls: urls,
          status: 'pending',
        })
        .eq('id', resolvedParams.id);

      if (updateError) throw updateError;

      // Trigger investigation
      const response = await fetch('/api/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investigationId: resolvedParams.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start investigation');
      }

      toast.success('Investigation started! This may take 2-5 minutes...');

      // Start polling
      setSubmitting(false);
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to start investigation');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!investigation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <CardTitle>Investigation Not Found</CardTitle>
            <CardDescription>The investigation you're looking for doesn't exist.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isProcessing = investigation.status === 'processing';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Investigation Portal</h1>
          <p className="text-lg text-gray-600">Target: {investigation.target_name}</p>
          <Badge variant={isProcessing ? 'default' : 'secondary'} className="mt-2">
            {investigation.status}
          </Badge>
        </div>

        {isProcessing ? (
          /* Processing View */
          <Card>
            <CardHeader>
              <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-center">AI Investigation In Progress</CardTitle>
              <CardDescription className="text-center">
                Our AI is conducting comprehensive research. This typically takes 2-5 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={50} className="mb-4" />
              <div className="space-y-2 text-sm text-gray-600">
                <p>✓ Analyzing target information...</p>
                <p>✓ Conducting web research across multiple sources...</p>
                <p>⏳ Analyzing documents and content...</p>
                <p>⏳ Generating comprehensive report...</p>
              </div>
              <p className="text-center text-sm text-gray-500 mt-6">
                You'll be automatically redirected when complete
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Input View */
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>📁 Upload Documents</CardTitle>
                <CardDescription>
                  Upload screenshots, PDFs, contracts, or any relevant files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {uploading ? (
                      <>
                        <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
                        <p>Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-semibold mb-2">Click to upload files</p>
                        <p className="text-sm text-gray-500">
                          Supports: Images, PDFs, Documents (Max 20MB each)
                        </p>
                      </>
                    )}
                  </label>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="text-sm font-semibold text-green-700">
                        {uploadedFiles.length} file(s) uploaded successfully
                      </p>
                    </div>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 bg-green-50 border border-green-200 p-3 rounded-lg">
                          <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-white">
                            ✓ Uploaded
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>📝 Paste Content</CardTitle>
                <CardDescription>
                  Paste any relevant text: emails, messages, descriptions, etc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste any relevant information here..."
                  rows={8}
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>🔗 Add URLs</CardTitle>
                <CardDescription>
                  Add websites or social media profiles to investigate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="https://example.com"
                    value={currentUrl}
                    onChange={(e) => setCurrentUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addUrl()}
                  />
                  <Button onClick={addUrl}>
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
                {urls.length > 0 && (
                  <div className="space-y-2">
                    {urls.map((url, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                        <span className="text-sm truncate flex-1">{url}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUrl(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full h-14 text-lg"
              onClick={submitInvestigation}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Starting Investigation...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Submit for AI Analysis
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
