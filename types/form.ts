export type FieldType = 'text' | 'textarea' | 'select' | 'rating' | 'file' | 'url' | 'email' | 'number';

export type TemplateType = 'company' | 'influencer' | 'app' | 'website' | 'custom';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[]; // For select fields
  min?: number; // For rating/number fields
  max?: number; // For rating/number fields
  validation?: {
    pattern?: string;
    message?: string;
  };
}

export interface InvestigationForm {
  id: string;
  created_by: string;
  title: string;
  description?: string;
  fields: FormField[];
  template_type?: TemplateType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFormInput {
  title: string;
  description?: string;
  fields: FormField[];
  template_type?: TemplateType;
}

export interface FormResponse {
  field_id: string;
  value: any;
}

export interface FormTemplate {
  title: string;
  description: string;
  template_type: TemplateType;
  fields: FormField[];
}
