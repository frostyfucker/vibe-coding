
export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  image?: string; // base64 data URL
}
