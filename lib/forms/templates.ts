import type { FormTemplate } from '@/types/form';
import { v4 as uuidv4 } from 'uuid';

/**
 * Pre-built form templates for different investigation types
 */

export const FORM_TEMPLATES: Record<string, FormTemplate> = {
  company: {
    title: 'Company Investigation',
    description:
      'Comprehensive business legitimacy and background check for companies and organizations',
    template_type: 'company',
    fields: [
      {
        id: uuidv4(),
        type: 'text',
        label: 'Company Name',
        placeholder: 'e.g., Acme Corporation',
        required: true,
      },
      {
        id: uuidv4(),
        type: 'url',
        label: 'Company Website',
        placeholder: 'https://example.com',
        helpText: 'Official company website URL',
        required: true,
      },
      {
        id: uuidv4(),
        type: 'text',
        label: 'Year Founded',
        placeholder: 'e.g., 2015',
        helpText: 'When was the company established?',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'text',
        label: 'Country of Registration',
        placeholder: 'e.g., United States',
        helpText: 'Very important for legitimacy verification',
        required: true,
      },
      {
        id: uuidv4(),
        type: 'text',
        label: 'Company Registration Number',
        placeholder: 'e.g., EIN, Company House number',
        helpText: 'Official registration or tax ID number',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'textarea',
        label: 'Business Model Description',
        placeholder: 'Describe how the company makes money...',
        helpText: 'Understanding their revenue model helps assess legitimacy',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'select',
        label: 'Industry Sector',
        options: [
          'Technology',
          'Finance',
          'E-commerce',
          'Healthcare',
          'Education',
          'Real Estate',
          'Cryptocurrency',
          'Investment/Trading',
          'Marketing',
          'Other',
        ],
        required: false,
      },
      {
        id: uuidv4(),
        type: 'email',
        label: 'Primary Contact Email',
        placeholder: 'contact@company.com',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'text',
        label: 'Phone Number',
        placeholder: '+1 (555) 123-4567',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'textarea',
        label: 'Physical Address',
        placeholder: 'Full business address including city, state, zip',
        helpText: 'Verifiable physical address is a positive indicator',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'textarea',
        label: 'Social Media Presence',
        placeholder: 'LinkedIn, Twitter, Facebook URLs...',
        helpText: 'List any official social media accounts',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'rating',
        label: 'How did you hear about them?',
        options: [
          'Social Media Advertisement',
          'Search Engine',
          'Referral',
          'Email',
          'News Article',
          'Other',
        ],
        required: false,
      },
      {
        id: uuidv4(),
        type: 'textarea',
        label: 'Specific Concerns',
        placeholder: 'What prompted you to investigate this company?',
        helpText: 'Any red flags or concerns you\'ve noticed',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'file',
        label: 'Supporting Documents',
        helpText:
          'Upload any relevant documents (screenshots, contracts, emails, etc.)',
        required: false,
      },
    ],
  },

  influencer: {
    title: 'Influencer / Creator Verification',
    description:
      'Verify the authenticity and credibility of social media influencers and content creators',
    template_type: 'influencer',
    fields: [
      {
        id: uuidv4(),
        type: 'text',
        label: 'Influencer Name / Handle',
        placeholder: '@username',
        required: true,
      },
      {
        id: uuidv4(),
        type: 'select',
        label: 'Primary Platform',
        options: [
          'Instagram',
          'TikTok',
          'YouTube',
          'Twitter/X',
          'Facebook',
          'LinkedIn',
          'Twitch',
          'Other',
        ],
        required: true,
      },
      {
        id: uuidv4(),
        type: 'url',
        label: 'Profile URL',
        placeholder: 'https://instagram.com/username',
        required: true,
      },
      {
        id: uuidv4(),
        type: 'number',
        label: 'Follower Count',
        placeholder: 'e.g., 50000',
        helpText: 'Approximate follower/subscriber count',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'textarea',
        label: 'Other Social Media Profiles',
        placeholder: 'List other social media accounts...',
        helpText: 'Cross-platform presence helps verify authenticity',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'select',
        label: 'Content Niche',
        options: [
          'Lifestyle',
          'Finance/Investing',
          'Fitness/Health',
          'Beauty/Fashion',
          'Technology',
          'Gaming',
          'Travel',
          'Food',
          'Education',
          'Business',
          'Other',
        ],
        required: false,
      },
      {
        id: uuidv4(),
        type: 'textarea',
        label: 'Engagement Observations',
        placeholder: 'Comment on likes, comments, engagement quality...',
        helpText: 'High follower count with low engagement can be suspicious',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'textarea',
        label: 'Promotions / Sponsorships',
        placeholder: 'What products or services are they promoting?',
        helpText: 'List any sponsored content or affiliate products',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'rating',
        label: 'What is your concern level?',
        min: 1,
        max: 10,
        helpText: '1 = Just curious, 10 = Major red flags',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'textarea',
        label: 'Specific Red Flags',
        placeholder: 'Any suspicious behavior or claims you\'ve noticed...',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'file',
        label: 'Screenshots or Evidence',
        helpText: 'Upload screenshots of concerning posts or interactions',
        required: false,
      },
    ],
  },

  app: {
    title: 'Mobile App / Software Investigation',
    description:
      'Investigate mobile apps, software, or SaaS products for legitimacy and security',
    template_type: 'app',
    fields: [
      {
        id: uuidv4(),
        type: 'text',
        label: 'App / Software Name',
        placeholder: 'e.g., MyFitnessPro',
        required: true,
      },
      {
        id: uuidv4(),
        type: 'select',
        label: 'Platform',
        options: [
          'iOS (App Store)',
          'Android (Google Play)',
          'Web Application',
          'Desktop Software (Windows)',
          'Desktop Software (Mac)',
          'Cross-Platform',
          'Other',
        ],
        required: true,
      },
      {
        id: uuidv4(),
        type: 'url',
        label: 'App Store / Download URL',
        placeholder: 'https://apps.apple.com/...',
        helpText: 'Link to app store listing or download page',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'url',
        label: 'Official Website',
        placeholder: 'https://example.com',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'text',
        label: 'Developer Name',
        placeholder: 'Name of company or developer',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'text',
        label: 'Current Version',
        placeholder: 'e.g., 2.3.1',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'number',
        label: 'Number of Downloads / Users',
        placeholder: 'e.g., 1000000',
        helpText: 'Approximate download count or user base',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'rating',
        label: 'App Store Rating',
        min: 1,
        max: 5,
        helpText: 'Average rating from app store',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'select',
        label: 'Pricing Model',
        options: [
          'Free',
          'Free with In-App Purchases',
          'Free with Ads',
          'One-Time Purchase',
          'Subscription',
          'Freemium',
        ],
        required: false,
      },
      {
        id: uuidv4(),
        type: 'text',
        label: 'Subscription Cost (if applicable)',
        placeholder: 'e.g., $9.99/month',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'textarea',
        label: 'Permissions Requested',
        placeholder: 'List permissions the app requests (camera, location, etc.)',
        helpText: 'Excessive permissions can be a red flag',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'textarea',
        label: 'Known Issues or Complaints',
        placeholder: 'Any complaints about charges, privacy, functionality...',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'textarea',
        label: 'Your Experience',
        placeholder: 'Describe your interaction with the app...',
        helpText: 'Any unexpected behavior or concerns',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'file',
        label: 'Screenshots',
        helpText: 'Upload screenshots of the app or suspicious elements',
        required: false,
      },
    ],
  },

  website: {
    title: 'Website Investigation',
    description: 'Investigate a website for legitimacy, safety, and trustworthiness',
    template_type: 'website',
    fields: [
      {
        id: uuidv4(),
        type: 'url',
        label: 'Website URL',
        placeholder: 'https://example.com',
        required: true,
      },
      {
        id: uuidv4(),
        type: 'text',
        label: 'Website Name / Brand',
        placeholder: 'Name shown on the website',
        required: true,
      },
      {
        id: uuidv4(),
        type: 'select',
        label: 'Website Category',
        options: [
          'E-commerce / Online Store',
          'Investment / Trading Platform',
          'Cryptocurrency Exchange',
          'Dating / Social',
          'News / Media',
          'Software / SaaS',
          'Job Board / Recruiting',
          'Financial Services',
          'Streaming / Entertainment',
          'Other',
        ],
        required: false,
      },
      {
        id: uuidv4(),
        type: 'rating',
        label: 'How did you find this website?',
        options: [
          'Social Media Ad',
          'Google Search',
          'Email',
          'Pop-up Ad',
          'Referral from Friend',
          'News Article',
          'Other',
        ],
        required: false,
      },
      {
        id: uuidv4(),
        type: 'textarea',
        label: 'What is the website offering?',
        placeholder: 'Products, services, investment opportunities...',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'textarea',
        label: 'Promises or Claims Made',
        placeholder: 'Any guarantees, earnings claims, time-limited offers...',
        helpText: 'Unrealistic promises are often red flags',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'textarea',
        label: 'Contact Information Provided',
        placeholder: 'Email, phone, address listed on site...',
        helpText: 'Legitimate sites usually have clear contact info',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'select',
        label: 'Are there trust badges or certifications?',
        options: ['Yes', 'No', 'Unsure'],
        helpText: 'SSL certificate, BBB rating, security seals, etc.',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'textarea',
        label: 'Payment Methods Accepted',
        placeholder: 'Credit card, cryptocurrency, wire transfer...',
        helpText: 'Payment methods that are hard to reverse are riskier',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'textarea',
        label: 'Red Flags Observed',
        placeholder: 'Poor grammar, pressure tactics, no refund policy...',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'textarea',
        label: 'Additional Context',
        placeholder: 'Any other information that might be relevant...',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'file',
        label: 'Website Screenshots',
        helpText: 'Upload screenshots of the site or concerning elements',
        required: false,
      },
    ],
  },

  custom: {
    title: 'Custom Investigation',
    description: 'Build a custom investigation form from scratch',
    template_type: 'custom',
    fields: [
      {
        id: uuidv4(),
        type: 'text',
        label: 'Investigation Target',
        placeholder: 'Name of person, company, or entity',
        required: true,
      },
      {
        id: uuidv4(),
        type: 'url',
        label: 'Relevant URL',
        placeholder: 'https://example.com',
        required: false,
      },
      {
        id: uuidv4(),
        type: 'textarea',
        label: 'Investigation Details',
        placeholder: 'Provide all relevant information...',
        required: true,
      },
      {
        id: uuidv4(),
        type: 'file',
        label: 'Supporting Documents',
        helpText: 'Upload any relevant files',
        required: false,
      },
    ],
  },
};

/**
 * Get a form template by type
 */
export function getFormTemplate(templateType: string): FormTemplate | null {
  return FORM_TEMPLATES[templateType] || null;
}

/**
 * Get all available form templates
 */
export function getAllFormTemplates(): FormTemplate[] {
  return Object.values(FORM_TEMPLATES);
}

/**
 * Get template names for selection
 */
export function getTemplateOptions(): Array<{ value: string; label: string }> {
  return [
    { value: 'company', label: 'Company Investigation' },
    { value: 'influencer', label: 'Influencer Verification' },
    { value: 'app', label: 'Mobile App / Software' },
    { value: 'website', label: 'Website Investigation' },
    { value: 'custom', label: 'Custom Investigation' },
  ];
}
