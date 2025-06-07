'use client';

import { useChat } from 'ai/react';
import { SignOutButton, UserButton, useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: Date;
}

export default function ChatPage() {
    const { user } = useUser();
    const params = useParams();
    const chatId = params.id as string;
    const [initialMessages, setInitialMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
        api: '/api/chat',
        body: { chatId },
        initialMessages,
        onError: (error) => {
            console.error('Chat error:', error);
            setError('Failed to send message. Please try again.');
        },
    });

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const loadChatHistory = async () => {
            if (!chatId) return;

            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/chats/${chatId}/messages`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Chat not found');
                        return;
                    }
                    throw new Error('Failed to load chat');
                }

                const history = await response.json();
                setInitialMessages(history);

                // If we have messages and the chat hook hasn't loaded them yet
                if (history.length > 0 && messages.length === 0) {
                    setMessages(history);
                }
            } catch (error) {
                console.error('Failed to load chat history:', error);
                setError('Failed to load chat history');
            } finally {
                setLoading(false);
            }
        };

        loadChatHistory();
    }, [chatId, setMessages, messages.length]);

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
                    <p className="text-gray-600">Please sign in to continue</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading chat...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full bg-gradient-to-r from-blue-400 to-indigo-600'>
            <div className="flex flex-col border-2 border-black bg-gray-50 h-screen max-w-4xl mx-auto">
                <header className="p-4 flex justify-between items-center px-10 border-b bg-gradient-to-r from-blue-900 to-indigo-500">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-50">Advanced SYNTHik</h1>
                        <p className="text-sm text-gray-50">Ask me anything - from math problems to coding questions!</p>
                    </div>
                    <UserButton />
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-500">
                                <div className="text-4xl mb-4">💬</div>
                                <p className='font-extrabold text-3xl'>Welcome {user.firstName}</p>
                                <p className="text-lg">Start a conversation!</p>
                                <p className="text-sm">Ask me about math, coding, or anything else.</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user'
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'bg-white text-gray-900 border shadow-sm'
                                        }`}
                                >
                                    <div className="whitespace-pre-wrap break-words">{message.content}</div>
                                    <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                        }`}>
                                        {new Date(message.createdAt || Date.now()).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white rounded-lg p-4 border shadow-sm">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="p-4 flex space-x-2 border-t bg-indigo-400">
                    <input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask me a math problem, coding question, or anything else..."
                        className="flex-1 bg-white text-gray-900 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-1">
                                <span className="dot dot1" />
                                <span className="dot dot2" />
                                <span className="dot dot3" />

                                <style jsx>{`
                                        .dot {
                                            width: 6px;
                                            height: 6px;
                                            background-color: white;
                                            border-radius: 9999px;
                                            display: inline-block;
                                            animation: bounce 1.4s infinite ease-in-out both;
                                        }
                                        .dot1 {
                                            animation-delay: -0.32s;
                                        }
                                        .dot2 {
                                            animation-delay: -0.16s;
                                        }
                                        .dot3 {
                                            animation-delay: 0s;
                                        }
                                        @keyframes bounce {
                                            0%, 80%, 100% {
                                            transform: scale(0);
                                            }
                                            40% {
                                            transform: scale(1);
                                            }
                                        }
                                        `}</style>
                            </div>
                        ) : (
                            'Send'
                        )}

                    </button>
                </form>
            </div>
        </div>
    );
}