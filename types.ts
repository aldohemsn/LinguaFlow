export enum TranslationMode {
  TRANSLATOR = 'TRANSLATOR',
  PROOFREADER = 'PROOFREADER'
}

export enum TextPurpose {
  INFORMATIVE = 'INFORMATIVE',
  EXPRESSIVE = 'EXPRESSIVE',
  OPERATIVE = 'OPERATIVE'
}

export const TEXT_PURPOSE_DETAILS = {
  [TextPurpose.INFORMATIVE]: {
    label: 'Informative',
    description: 'Focus on content, facts, and clarity (e.g., Reports, News, Manuals)',
    icon: '📊'
  },
  [TextPurpose.EXPRESSIVE]: {
    label: 'Expressive',
    description: 'Focus on aesthetic, style, and author\'s voice (e.g., Literature, Essays)',
    icon: '🎭'
  },
  [TextPurpose.OPERATIVE]: {
    label: 'Operative',
    description: 'Focus on persuasion and inducing action (e.g., Ads, Speeches)',
    icon: '📢'
  }
};

export interface TranslationState {
  inputText: string;
  outputText: string;
  isLoading: boolean;
  error: string | null;
  mode: TranslationMode;
}

export interface TranslationResponse {
  text: string;
  error?: string;
}
