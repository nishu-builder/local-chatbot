export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export type ChatState = {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
};

export type ModelConfig = {
  modelName: string;
  temperature: number;
  maxTokens: number;
}; 