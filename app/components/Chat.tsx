"use client";

import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ModelSettings from './ModelSettings';
import { Message, ChatState, ModelConfig } from '../types';
import { fetchAvailableModels, generateResponse, checkOllamaStatus } from '../utils/api';

export default function Chat() {
  // Chat state
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  // Model config
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    modelName: process.env.NEXT_PUBLIC_DEFAULT_MODEL || 'llama3.2:1b',
    temperature: 0.7,
    maxTokens: 2048,
  });

  // Available models
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Ollama status
  const [ollamaRunning, setOllamaRunning] = useState<boolean>(false);

  // Message container ref for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch available models on component mount
  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkOllamaStatus();
      setOllamaRunning(status);

      if (status) {
        const models = await fetchAvailableModels();
        if (models.length > 0) {
          setAvailableModels(models);
          // Set first available model as default if no model is selected
          if (!modelConfig.modelName && models.length > 0) {
            setModelConfig((prev) => ({ ...prev, modelName: models[0] }));
          }
        }
      }
    };

    checkStatus();

    // Check status every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!ollamaRunning) {
      setChatState((prev) => ({
        ...prev,
        error: 'Ollama is not running. Please start Ollama and try again.',
      }));
      return;
    }

    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Update state with user message
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      // Get the response from the API
      const responseContent = await generateResponse(
        [...chatState.messages, userMessage].map(({ role, content }) => ({ role, content })),
        modelConfig
      );

      // Create assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      // Update state with assistant message
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  };

  // Clear chat
  const handleClearChat = () => {
    setChatState({
      messages: [],
      isLoading: false,
      error: null,
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-xl font-bold">Local Chatbot</h1>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${ollamaRunning ? 'bg-green-500' : 'bg-red-500'
                }`}
            ></div>
            <span className="text-sm">{ollamaRunning ? 'Ollama connected' : 'Ollama disconnected'}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r p-4 hidden md:block">
          <ModelSettings
            modelConfig={modelConfig}
            onModelConfigChange={setModelConfig}
            availableModels={availableModels}
          />
          <button
            onClick={handleClearChat}
            className="w-full py-2 border rounded hover:bg-gray-100 transition-colors"
          >
            Clear Chat
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto">
              {chatState.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <h2 className="text-2xl font-bold mb-2">Welcome to Local Chatbot</h2>
                  <p className="mb-4">
                    This chat connects to a locally running Ollama instance.
                  </p>
                  {!ollamaRunning && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md max-w-md">
                      <p className="font-medium">Ollama is not running</p>
                      <p className="text-sm">
                        Please make sure Ollama is installed and running on your machine.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                chatState.messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))
              )}
              {chatState.isLoading && (
                <div className="flex items-center space-x-2 p-4 text-gray-500">
                  <div className="animate-pulse">Thinking...</div>
                </div>
              )}
              {chatState.error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md my-4">
                  <p>{chatState.error}</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t p-4">
            <ChatInput onSendMessage={handleSendMessage} isLoading={chatState.isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
} 