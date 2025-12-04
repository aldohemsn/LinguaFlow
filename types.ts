export enum TranslationMode {
  TRANSLATOR = 'TRANSLATOR',
  PROOFREADER = 'PROOFREADER'
}

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
