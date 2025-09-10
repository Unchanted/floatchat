"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message } from '../components/chats/chat-interface';

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface ChatContextType {
  /** Array of all chats */
  chats: Chat[];
  /** ID of the currently active chat */
  activeChatId: string | null;
  /** The currently active chat object */
  activeChat: Chat | null;
  /** Creates a new chat and returns its ID */
  createNewChat: () => string;
  /** Switches to a different chat by ID */
  switchToChat: (chatId: string) => void;
  /** Updates the title of a chat */
  updateChatTitle: (chatId: string, title: string) => void;
  /** Adds a message to a specific chat */
  addMessageToChat: (chatId: string, message: Message) => void;
  /** Deletes a chat by ID */
  deleteChat: (chatId: string) => void;
  /** Clears all chats */
  clearAllChats: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = 'floatchat-chats';

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Load chats from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedChats = JSON.parse(stored);
        setChats(parsedChats);
        
        // Set the most recently updated chat as active
        if (parsedChats.length > 0) {
          const mostRecent = parsedChats.reduce((latest: Chat, current: Chat) => 
            new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest
          );
          setActiveChatId(mostRecent.id);
        }
      }
    } catch (error) {
      console.error('Failed to load chats from localStorage:', error);
    }
  }, []);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error('Failed to save chats to localStorage:', error);
    }
  }, [chats]);

  const createNewChat = (): string => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat.id;
  };

  const switchToChat = (chatId: string) => {
    setActiveChatId(chatId);
  };

  const updateChatTitle = (chatId: string, title: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, title, updatedAt: new Date().toISOString() }
        : chat
    ));
  };

  const addMessageToChat = (chatId: string, message: Message) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const updatedChat = {
          ...chat,
          messages: [...chat.messages, message],
          updatedAt: new Date().toISOString(),
        };

        // Auto-generate title from first user message if still "New Chat"
        if (chat.title === 'New Chat' && message.role === 'user') {
          const truncatedTitle = message.content.length > 50 
            ? message.content.substring(0, 50) + '...'
            : message.content;
          updatedChat.title = truncatedTitle;
        }

        return updatedChat;
      }
      return chat;
    }));
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => {
      const filtered = prev.filter(chat => chat.id !== chatId);
      
      // If we're deleting the active chat, switch to another one
      if (activeChatId === chatId) {
        if (filtered.length > 0) {
          setActiveChatId(filtered[0].id);
        } else {
          setActiveChatId(null);
        }
      }
      
      return filtered;
    });
  };

  const clearAllChats = () => {
    setChats([]);
    setActiveChatId(null);
  };

  const activeChat = activeChatId ? chats.find(chat => chat.id === activeChatId) || null : null;

  const value: ChatContextType = {
    chats,
    activeChatId,
    activeChat,
    createNewChat,
    switchToChat,
    updateChatTitle,
    addMessageToChat,
    deleteChat,
    clearAllChats,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
