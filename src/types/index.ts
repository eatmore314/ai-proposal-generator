export type SectionKey = 'scope' | 'timeline' | 'quote' | 'contract' | 'questions';

export interface ProposalSections {
  scope: string;
  timeline: string;
  quote: string;
  contract: string;
  questions: string;
}

export type GenerationStatus = 'idle' | 'generating' | 'done' | 'error';

export type ProviderType = 'independent' | 'consultant' | 'agency';
