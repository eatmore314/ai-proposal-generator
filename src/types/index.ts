export type SectionKey =
  | 'analysis'
  | 'summary'
  | 'scope'
  | 'timeline'
  | 'pricing'
  | 'assumptions'
  | 'exclusions'
  | 'risks'
  | 'questions'
  | 'agreement';

export interface ProposalSections {
  analysis:    string;
  summary:     string;
  scope:       string;
  timeline:    string;
  pricing:     string;
  assumptions: string;
  exclusions:  string;
  risks:       string;
  questions:   string;
  agreement:   string;
}

export type GenerationStatus = 'idle' | 'generating' | 'done' | 'error';

export type PricingModel = 'auto' | 'fixed' | 'hourly' | 'retainer' | 'milestone' | 'package';
export type Currency    = 'auto' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
export type Region      = 'auto' | 'us' | 'uk' | 'eu' | 'ca' | 'au';

export interface AdvancedOptions {
  industryOverride:     string;
  pricingModelOverride: PricingModel;
  currency:             Currency;
  region:               Region;
}
