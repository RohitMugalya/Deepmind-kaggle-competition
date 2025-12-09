export interface GeneratedContent {
  motionCanvasCode: string;
  previewCode: string; // A JavaScript function body for immediate canvas preview
  explanation: string;
}

export interface AnimationState {
  isPlaying: boolean;
  time: number;
  duration: number;
}

export enum TabView {
  PREVIEW = 'PREVIEW',
  CODE = 'CODE',
}

export interface HistoryItem {
  id: string;
  prompt: string;
  timestamp: number;
  content: GeneratedContent;
}