import {
  Search, ClipboardList, Layers, CalendarDays, DollarSign,
  Info, MinusCircle, ShieldAlert, HelpCircle, FileText,
  type LucideIcon,
} from 'lucide-react';
import type { SectionKey } from '@/types';

export interface SectionMeta {
  label:       string;
  Icon:        LucideIcon;
  description: string;
  hidden?:     boolean;
}

export const SECTION_CONFIG: Record<SectionKey, SectionMeta> = {
  analysis: {
    label:       'Auto-detecting industry',
    Icon:        Search,
    description: 'Silently calibrates industry, pricing model, and confidence',
    hidden:      true,
  },
  summary: {
    label:       'Project Summary',
    Icon:        ClipboardList,
    description: 'Overview, objectives, and engagement snapshot',
  },
  scope: {
    label:       'Scope of Work',
    Icon:        Layers,
    description: 'Deliverables, services included, and delivery method',
  },
  timeline: {
    label:       'Timeline',
    Icon:        CalendarDays,
    description: 'Phased delivery plan with milestones',
  },
  pricing: {
    label:       'Pricing Estimates',
    Icon:        DollarSign,
    description: 'Three-tier estimates with confidence score and rationale',
  },
  assumptions: {
    label:       'Assumptions',
    Icon:        Info,
    description: 'Key assumptions underlying this proposal',
  },
  exclusions: {
    label:       'Exclusions',
    Icon:        MinusCircle,
    description: 'Explicitly out of scope for this engagement',
  },
  risks: {
    label:       'Risks',
    Icon:        ShieldAlert,
    description: 'Identified risks with likelihood, impact, and mitigation',
  },
  questions: {
    label:       'Discovery Questions',
    Icon:        HelpCircle,
    description: 'Pre-kickoff questions tailored to the client and industry',
  },
  agreement: {
    label:       'Agreement Draft',
    Icon:        FileText,
    description: 'Service agreement template for this engagement type',
  },
};

export const SECTION_ORDER: SectionKey[] = [
  'analysis',
  'summary',
  'scope',
  'timeline',
  'pricing',
  'assumptions',
  'exclusions',
  'risks',
  'questions',
  'agreement',
];
