'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, LogOut, ChevronDown, Plus } from 'lucide-react';
import { AuthProvider, useAuth } from './FirebaseAuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Chat {
  id: number;
  created_at: string;
  updated_at: string;
}

function UserAvatarDropdown({ user, logout }: { user: any; logout: () => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white rounded-full px-3 py-2 shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {user.displayName || user.email}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.displayName || 'User'}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

function ChatPageInner() {
  const { user, loading, login, logout } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPlans, setIsGeneratingPlans] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageOffset, setMessageOffset] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all chats for the user
  useEffect(() => {
    if (!user) return;
    setLoadingChats(true);
    fetch(`/api/chats?firebase_uid=${user.uid}&email=${user.email}`)
      .then(res => res.json())
      .then(data => {
        setChats(data.chats || []);
      })
      .finally(() => setLoadingChats(false));
  }, [user]);

  // Fetch messages for selected chat
  const fetchMessages = async (selectedChatId: string, offset = 0, append = false) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chats/${selectedChatId}/messages?firebase_uid=${user?.uid}&email=${user?.email}&limit=10&offset=${offset}`);
      const data = await res.json();
      if (res.ok) {
        if (append) {
          setMessages(prev => [...prev, ...data.messages]);
        } else {
          setMessages(data.messages);
        }
        setHasMoreMessages(data.messages.length === 10);
        setMessageOffset(offset + data.messages.length);
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  // Restore chat from localStorage or when chatId changes
  useEffect(() => {
    const storedChatId = localStorage.getItem('chat_id');
    if (storedChatId && user) {
      setChatId(storedChatId);
      fetchMessages(storedChatId);
    }
  }, [user]);

  useEffect(() => {
    if (chatId) localStorage.setItem('chat_id', chatId);
  }, [chatId]);

  const handleSelectChat = (id: number) => {
    setChatId(id.toString());
    fetchMessages(id.toString());
  };

  const handleLoadMore = () => {
    if (chatId) fetchMessages(chatId, messageOffset, true);
  };

  const handleNewChat = async () => {
    setChatId(null);
    setMessages([]);
    setMessageOffset(0);
    setHasMoreMessages(true);
    localStorage.removeItem('chat_id');
    
    // Refresh the chat list to show the new chat
    if (user) {
      setLoadingChats(true);
      try {
        const res = await fetch(`/api/chats?firebase_uid=${user.uid}&email=${user.email}`);
        const data = await res.json();
        setChats(data.chats || []);
      } finally {
        setLoadingChats(false);
      }
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !user) return;
    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, created_at: new Date().toISOString() }]);
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebase_uid: user.uid,
          email: user.email,
          name: user.displayName,
          avatar_url: user.photoURL,
          chat_id: chatId,
          message: userMessage,
        }),
      });
      if (!response.ok) throw new Error('Failed to get response');
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, created_at: new Date().toISOString() }]);
      if (data.chat_id) setChatId(data.chat_id.toString());
      if (userMessage.toLowerCase().match(/\b(okay|go ahead|generate|show me the plans)\b/)) {
        await generateFinancialPlans(data.chat_id);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error: Something went wrong. Please try again.', created_at: new Date().toISOString() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFinancialPlans = async (chat_id_override?: string) => {
    setIsGeneratingPlans(true);
    try {
      const summaryPrompt = `From the previous conversation, summarize the user's financial profile, then create 3 financial plan options:\n1. Conservative (low risk)\n2. Balanced (moderate risk)\n3. Aggressive (high risk)\n\nEach plan must include:\n- Allocation suggestions (saving, investing, emergency fund)\n- Estimated time to reach goals\n- Strategy summary`;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebase_uid: user?.uid,
          email: user?.email,
          name: user?.displayName,
          avatar_url: user?.photoURL,
          chat_id: chat_id_override || chatId,
          message: summaryPrompt,
        }),
      });
      if (!response.ok) throw new Error('Failed to generate plans');
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, created_at: new Date().toISOString() }]);
      if (data.chat_id) setChatId(data.chat_id.toString());
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error generating plans. Please try again.', created_at: new Date().toISOString() }]);
    } finally {
      setIsGeneratingPlans(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Sign in to chat</h2>
      <button onClick={login} className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600">Sign in with Google</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">💬 AI Financial Planner</h1>
          <UserAvatarDropdown user={user} logout={logout} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 flex flex-col md:flex-row gap-4">
        {/* Sidebar: Chat History */}
        <div className="w-full md:w-1/4 bg-white rounded-lg shadow-lg p-4 mb-4 md:mb-0">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-lg text-black">Chat History</span>
            <button 
              onClick={handleNewChat} 
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-3 h-3" />
              <span>New Chat</span>
            </button>
          </div>
          {loadingChats ? (
            <div className="text-center text-black">Loading...</div>
          ) : (
            <ul className="space-y-2">
              {chats.length === 0 && <li className="text-black text-sm">No chats yet</li>}
              {chats.map(chat => (
                <li key={chat.id}>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg text-black ${chatId === chat.id.toString() ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'}`}
                    onClick={() => handleSelectChat(chat.id)}
                  >
                    Chat #{chat.id}<br />
                    <span className="text-xs text-black">{new Date(chat.created_at).toLocaleString()}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-black">
              Talk to the assistant about your financial situation. It will ask questions and generate 3 tailored financial plans.
            </p>
          </div>

          {/* Chat Container */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              <div ref={messagesEndRef} />
              {messages.length === 0 && !isLoading && !isGeneratingPlans && (
                <div className="text-center text-black py-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Start a conversation about your financial goals!</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[80%] ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {message.created_at ? new Date(message.created_at).toLocaleString() : 'Just now'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(isLoading || isGeneratingPlans) && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span>{isGeneratingPlans ? 'Generating your personalized plans...' : 'Thinking...'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {hasMoreMessages && messages.length > 0 && !loadingMessages && (
                <div className="flex justify-center my-2">
                  <button
                    onClick={handleLoadMore}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
                  >
                    Load More
                  </button>
                </div>
              )}
              {loadingMessages && (
                <div className="flex justify-center my-2 text-xs text-black">Loading more...</div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me about your financial situation or goals..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading || isGeneratingPlans}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading || isGeneratingPlans}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <AuthProvider>
      <ChatPageInner />
    </AuthProvider>
  );
} 