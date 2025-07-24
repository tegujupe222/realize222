import React, { useState, useRef, useEffect } from 'react';
import { getAiChatResponse } from '../services/geminiService';
import Slide from './Slide';
import BotIcon from './icons/BotIcon';
import { Member, Task, TimetableEntry, ScheduleEvent, Announcement } from '../types';

interface AiChatProps {
    members: Member[];
    tasks: Task[];
    timetables: TimetableEntry[];
    events: ScheduleEvent[];
    announcements: Announcement[];
}

interface ChatMessage {
    id: string;
    author: 'user' | 'ai';
    text: string;
    isLoading?: boolean;
}

const AiChat: React.FC<AiChatProps> = (props) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'initial',
            author: 'ai',
            text: 'こんにちは！AIアシスタントです。メンバーの予定やタスクについて質問があれば、何でも聞いてください。',
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const query = inputValue.trim();
        if (!query || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            author: 'user',
            text: query,
        };
        const loadingMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            author: 'ai',
            text: '...',
            isLoading: true,
        };
        
        setMessages(prev => [...prev, userMessage, loadingMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const aiResponseText = await getAiChatResponse({ query, ...props });
            const aiMessage: ChatMessage = {
                id: (Date.now() + 2).toString(),
                author: 'ai',
                text: aiResponseText,
            };
            setMessages(prev => [...prev.slice(0, -1), aiMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 2).toString(),
                author: 'ai',
                text: '申し訳ありません、エラーが発生しました。',
            };
            setMessages(prev => [...prev.slice(0, -1), errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Slide title="AIアシスタント" icon={<BotIcon className="w-7 h-7" />}>
            <div className="flex flex-col h-full">
                <div className="flex-grow overflow-y-auto pr-4 space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                             {msg.author === 'ai' && <BotIcon className="w-8 h-8 p-1.5 rounded-full bg-teal-500 text-slate-900 flex-shrink-0" />}
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.author === 'user' ? 'bg-teal-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                {msg.isLoading ? (
                                    <div className="flex items-center gap-1">
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                                    </div>
                                ) : (
                                    <p className="text-sm">{msg.text}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="AIアシスタントに質問..."
                        className="flex-grow bg-slate-900 border-2 border-slate-700 rounded-full px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                        disabled={isLoading}
                    />
                    <button type="submit" className="bg-teal-600 hover:bg-teal-500 disabled:bg-slate-600 text-white font-bold py-2 px-4 rounded-full transition-colors" disabled={isLoading || !inputValue}>
                        送信
                    </button>
                </form>
            </div>
        </Slide>
    );
};

export default AiChat;
