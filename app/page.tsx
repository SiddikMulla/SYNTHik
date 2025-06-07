'use client';

import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Plus, Trash2, Sparkles, Clock, Calendar, ArrowRight, Zap, Brain, Shield } from 'lucide-react';

interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = async () => {
    try {
      setError(null);
      const response = await fetch('/api/chats');

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please sign in to view your chats');
          return;
        }
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
      setError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      setCreating(true);
      setError(null);

      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Chat',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const newChat = await response.json();
      router.push(`/chat/${newChat.id}`);
    } catch (error) {
      console.error('Failed to create chat:', error);
      setError('Failed to create new chat');
    } finally {
      setCreating(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats?chatId=${chatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      setChats(chats.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error('Failed to delete chat:', error);
      setError('Failed to delete chat');
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchChats();
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="text-violet-200 font-medium">Loading your SYNTHik...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-900 to-gray-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=...')] opacity-20"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-15">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-violet-500 to-blue-500 p-6 rounded-2xl">
                  <Brain className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>

            {/* Headings */}
            <h1 className="text-6xl md:text-6xl font-bold bg-gradient-to-r from-white via-violet-100 to-blue-200 bg-clip-text text-transparent mb-6 leading-tight">
              SYNTHik
            </h1>
            <p className="text-xl md:text-2xl text-violet-100 mb-4 font-light">
              Your intelligent conversation partner
            </p>
            <p className="text-base text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              A fast, private AI chatbot powered by LLaMA 3.1. it delivers intelligent, natural conversations-locally hosted, privacy-first, and always ready to help you think, create, and solve.
            </p>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-3xl mx-auto">
              {/* Feature 1 */}
              <div className="text-center group">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
                  <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Lightning Fast</h3>
                  <p className="text-slate-400 text-sm">Get instant responses to your queries with advanced AI processing</p>
                </div>
              </div>
              {/* Feature 2 */}
              <div className="text-center group">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
                  <Shield className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Secure & Private</h3>
                  <p className="text-slate-400 text-sm">Your conversations are encrypted and stored securely</p>
                </div>
              </div>
              {/* Feature 3 */}
              <div className="text-center group">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
                  <Sparkles className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Creative Solutions</h3>
                  <p className="text-slate-400 text-sm">From writing to problem-solving, unleash your creativity</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <SignInButton mode="modal">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-violet-500/25">
                <span className="flex items-center space-x-2">
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 blur-xl opacity-0 group-hover:opacity-30 transition-opacity -z-10"></div>
              </button>
            </SignInButton>

            <p className="text-slate-300 text-sm mt-4">No credit card required • Free to start</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-violet-500 to-blue-500 p-2 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  SYNTHik
                </h1>
                <p className="text-slate-500 text-sm">Intelligent conversations await</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden md:block text-slate-600">
                Welcome back, <span className="font-medium text-slate-800">{user.firstName || user.emailAddresses[0].emailAddress}</span>
              </div>

              <button
                onClick={createNewChat}
                disabled={creating}
                className="group relative px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {creating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>New Chat</span>
                  </div>
                )}
              </button>

              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-xl"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 shadow-sm">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 text-xl leading-none"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-slate-200 rounded mb-3"></div>
                    <div className="h-3 bg-slate-100 rounded mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="absolute -inset-4 bg-gradient-to-r from-violet-600 to-blue-600 rounded-full blur-xl opacity-20"></div>
                <div className="relative bg-gradient-to-r from-violet-100 to-blue-100 p-8 rounded-3xl">
                  <MessageSquare className="w-16 h-16 text-violet-600 mx-auto" />
                </div>
              </div>
            </div>

            <h3 className="text-3xl font-bold text-slate-800 mb-4">Start Your First Conversation</h3>
            <p className="text-xl text-slate-600 mb-8 max-w-md mx-auto">
              Ready to explore the possibilities? Create your first chat and experience intelligent AI assistance.
            </p>

            <button
              onClick={createNewChat}
              disabled={creating}
              className="group px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Create Your First Chat</span>
              </div>
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Your Conversations</h2>
              <p className="text-slate-600">Continue where you left off or start something new</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {chats.map((chat, index) => (
                <div
                  key={chat.id}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:shadow-violet-100 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                >
                  <div className="h-2 bg-gradient-to-r from-violet-500 to-blue-500"></div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-slate-800 text-lg truncate flex-1 group-hover:text-violet-700 transition-colors">
                        {chat.title || 'Untitled Chat'}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (confirm('Are you sure you want to delete this chat?')) {
                            deleteChat(chat.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 mb-6 text-sm text-slate-500">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Created {new Date(chat.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Updated {new Date(chat.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Link
                      href={`/chat/${chat.id}`}
                      className="block w-full text-center px-4 py-3 bg-gradient-to-r from-violet-50 to-blue-50 hover:from-violet-100 hover:to-blue-100 text-violet-700 font-medium rounded-xl transition-all duration-300 group-hover:shadow-md"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span>Open Chat</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}