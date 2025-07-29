import { useState } from 'react';
import { fetchFromOpenRouter } from '../utils/openrouter';

export interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

const MODEL_LIST = [
  'deepseek/deepseek-r1:free',
  'deepseek/deepseek-chat-v3-0324:free',
  'deepseek/deepseek-r1-0528:free',
  'qwen/qwen3-coder:free',
  'qwen/qwen3-235b-a22b-2507:free',
  'moonshotai/kimi-k2:free',
  'google/gemini-2.0-flash-exp:free',
  'microsoft/mai-ds-r1:free',
]

const getRandomEmoji = () => {
  const emojis = ['😎','👩‍💻','🧑‍🚀','🧙‍♂️','👨‍🎨','🦸‍♀️','🧞‍♂️'];
  return emojis[Math.floor(Math.random() * emojis.length)];
};

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [model, setModel] = useState(MODEL_LIST[0]);
  const [isLoading, setIsLoading] = useState(false);

  // 头像只随机生成一次，首次渲染时调用 getRandomEmoji
  const [userAvatar] = useState(getRandomEmoji);

  const sendMessage = async (content: string, role: 'user' | 'system' = 'user') => {
    if (role === 'system') {
      setMessages([{ role: 'assistant', content: 'Hello! How can I help you today? 🤖' }]);
      return;
    }

    if (role === 'user') {
      const userMsg: Message = { role: 'user', content };
      const loadingMsg: Message = { role: 'assistant', content: '__loading__' };

      setMessages(prev => [...prev, userMsg, loadingMsg]);
      setIsLoading(true);

      try {
        const reply = await fetchFromOpenRouter([...messages, userMsg], model);

        setMessages(prev => {
          const withoutLoading = prev.filter(msg => msg.content !== '__loading__');
          return [...withoutLoading, { role: 'assistant', content: reply }];
        });
      } catch {
        setMessages(prev => {
          const withoutLoading = prev.filter(msg => msg.content !== '__loading__');
          return [...withoutLoading, { role: 'error', content: '❌ Failed to get response.' }];
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    messages,
    sendMessage,
    userAvatar,
    model,
    setModel,
    modelList: MODEL_LIST,
    isLoading,
  };
};
