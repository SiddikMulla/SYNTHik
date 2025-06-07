'use client';

import { useChat } from 'ai/react';
import { SignOutButton, UserButton, useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Send, Sparkles, User, Bot, Menu, Plus, MessageSquare, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: Date;
}

const CodeBlock = ({ children, language = 'text' }: { children: string; language?: string }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(children);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    // Split code into lines and add line numbers
    const lines = children.split('\n');
    const hasMultipleLines = lines.length > 1;

    return (
        <div className="relative group my-4 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-2.5 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                    <div className="flex space-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="font-mono text-xs text-gray-400 ml-2">{language}</span>
                </div>
                <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs hover:bg-gray-700 active:bg-gray-600 transition-all duration-150 border border-gray-600 hover:border-gray-500"
                    title="Copy to clipboard"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-green-400 font-medium">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code Content */}
            <div className="bg-gray-900 text-gray-100 overflow-x-auto">
                <pre className="p-0 m-0">
                    <code className="block">
                        {hasMultipleLines ? (
                            <table className="w-full border-collapse">
                                <tbody>
                                    {lines.map((line, index) => (
                                        <tr key={index} className="hover:bg-gray-800/30 transition-colors duration-150">
                                            <td className="text-right text-gray-500 select-none px-3 py-0.5 text-sm font-mono border-r border-gray-700 bg-gray-800/50 sticky left-0 min-w-[3rem]">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-0.5">
                                                <span className="text-sm font-mono leading-6 whitespace-pre">
                                                    {line || ' '}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="px-4 py-3">
                                <span className="text-sm font-mono leading-6 whitespace-pre">
                                    {children}
                                </span>
                            </div>
                        )}
                    </code>
                </pre>
            </div>
        </div>
    );
};

// Message Content Parser Component
const MessageContent = ({ content }: { content: string }) => {
    return (
        <div className="prose dark:prose-invert max-w-none text-base leading-relaxed">
            <ReactMarkdown
                children={content}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    code({ inline, className, children, ...props }: any) {
                        return inline ? (
                            <code
                                className="bg-gray-100 dark:bg-gray-800 text-purple-600 dark:text-purple-400 px-1 py-0.5 rounded font-mono text-sm"
                                {...props}
                            >
                                {children}
                            </code>
                        ) : (
                            <pre className="bg-gray-900 text-white rounded-xl p-4 overflow-x-auto my-4 text-sm">
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            </pre>
                        );
                    },
                    a({ href, children, ...props }) {
                        return (
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800"
                                {...props}
                            >
                                {children}
                            </a>
                        );
                    },
                }}
            />
        </div>
    );
};

export default function ModernChatInterface() {
    const { user } = useUser();
    const params = useParams();
    const chatId = params.id as string;
    const [initialMessages, setInitialMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [input]);

    const exampleQuestions = [
        "Explain quantum computing in simple terms",
        "Write a Python function to sort an array",
        "What are the latest trends in web development?",
        "Help me debug this JavaScript code"
    ];

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Authentication Required</h2>
                    <p className="text-gray-600 dark:text-gray-400">Please sign in to continue</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Error</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">SYNTHik</h1>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <button className="w-full flex items-center space-x-2 p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                            <Plus className="w-4 h-4 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Chat</span>
                        </button>

                        <div className="mt-6">
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Recent Chats</h3>
                            <div className="space-y-1">
                                {['Python Development', 'UI/UX Design Tips', 'Machine Learning Basics'].map((chat, index) => (
                                    <button
                                        key={index}
                                        className="w-full flex items-center space-x-2 p-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                                    >
                                        <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{chat}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <UserButton />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {user.firstName || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {user.emailAddresses[0]?.emailAddress}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col lg:ml-0">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="hidden sm:block">
                            <p className="text-base pt-4 text-gray-500 dark:text-gray-400">Ask me anything - from math problems to coding questions!</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="hidden sm:flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-green-700 dark:text-green-400">Online</span>
                        </div>
                    </div>
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <p className='font-extrabold text-3xl text-gray-900 dark:text-white mb-2'>Welcome {user.firstName}</p>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">Start a conversation!</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 max-w-md">
                                Ask me about math, coding, or anything else.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                                {exampleQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleInputChange({ target: { value: question } } as any)}
                                        className="p-4 text-left rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 group"
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{question}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 p-4 max-w-4xl mx-auto">
                            {messages.map((message, index) => (
                                <div
                                    key={message.id}
                                    className={`flex space-x-4 animate-in slide-in-from-bottom-2 duration-500`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user'
                                        ? 'bg-gradient-to-br from-green-400 to-blue-500'
                                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                                        }`}>
                                        {message.role === 'user' ? (
                                            <User className="w-4 h-4 text-white" />
                                        ) : (
                                            <Bot className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {message.role === 'user' ? 'You' : 'SYNTHik AI'}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(message.createdAt || Date.now()).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div className={`prose prose-sm max-w-none ${message.role === 'user'
                                            ? 'text-gray-700 dark:text-gray-300'
                                            : 'text-gray-800 dark:text-gray-200'
                                            }`}>
                                            <MessageContent content={message.content} />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex space-x-4 animate-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">thinking...</span>
                                        </div>
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
                    )}
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            <div className="flex items-end space-x-3">
                                <div className="flex-1 relative">
                                    <textarea
                                        ref={textareaRef}
                                        value={input}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Ask me a math problem, coding question, or anything else..."
                                        className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 pr-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 min-h-[48px] max-h-[120px]"
                                        disabled={isLoading}
                                        rows={1}
                                    />
                                    <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            {input.length > 0 && `${input.length}`}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !input.trim()}
                                    className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                            SYNTHik AI Designed and Developed by Siddik
                        </p>
                    </div>
                </div>
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}