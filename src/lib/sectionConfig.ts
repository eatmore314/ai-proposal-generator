import { Layers, Calendar, DollarSign, FileText, HelpCircle, type LucideIcon } from 'lucide-react';
import type { SectionKey } from '@/types';

export interface SectionMeta {
  label: string;
  Icon: LucideIcon;
  description: string;
}

export const SECTION_CONFIG: Record<SectionKey, SectionMeta> = {
  scope: {
    label: 'Project Scope',
    Icon: Layers,
    description: 'Deliverables, inclusions, and boundaries',
  },
  timeline: {
    label: 'Timeline',
    Icon: Calendar,
    description: 'Phased delivery plan with milestones',
  },
  quote: {
    label: 'Quote',
    Icon: DollarSign,
    description: 'Itemized pricing and payment schedule',
  },
  contract: {
    label: 'Contract Draft',
    Icon: FileText,
    description: 'Service agreement template',
  },
  questions: {
    label: 'Discovery Questions',
    Icon: HelpCircle,
    description: 'Pre-kickoff questions for the client',
  },
};

export const SECTION_ORDER: SectionKey[] = [
  'scope',
  'timeline',
  'quote',
  'contract',
  'questions',
];
