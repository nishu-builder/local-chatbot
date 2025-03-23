import axios from 'axios';
import { ModelConfig } from '../types';

const OLLAMA_BASE_URL = process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || 'http://localhost:11434';

export async function fetchAvailableModels(): Promise<string[]> {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    return response.data.models.map((model: { name: string }) => model.name);
  } catch (error) {
    console.error('Error fetching available models:', error);
    return [];
  }
}

export async function generateResponse(
  messages: { role: string; content: string }[],
  modelConfig: ModelConfig
): Promise<string> {
  try {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/chat`, {
      model: modelConfig.modelName,
      messages: formattedMessages,
      options: {
        temperature: modelConfig.temperature,
        num_predict: modelConfig.maxTokens,
      },
      stream: false,
    });

    if (typeof response.data === 'string') {
      try {
        const lines = response.data.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const lastObject = JSON.parse(lastLine);

        if (lastObject.done === true) {
          let fullMessage = '';
          for (const line of lines) {
            try {
              const obj = JSON.parse(line);
              if (obj.message && obj.message.content) {
                fullMessage += obj.message.content;
              }
            } catch (e) {
              console.error('Error parsing line:', e);
            }
          }
          return fullMessage;
        } else {
          return 'Could not process the complete response.';
        }
      } catch (e) {
        console.error('Error processing streaming response:', e);
        return 'Error processing the response.';
      }
    } else if (response.data?.message?.content) {
      return response.data.message.content;
    } else if (response.data?.response) {
      return response.data.response;
    } else {
      console.error('Unexpected response format:', response.data);
      return 'Received response in an unexpected format.';
    }
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response. Check if Ollama is running.');
  }
}

export async function checkOllamaStatus(): Promise<boolean> {
  try {
    await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    return true;
  } catch {
    return false;
  }
}
