
import React, { useState, useEffect } from 'react';
import { fetchInspirationalQuote } from '../services/geminiService';
import Slide from './Slide';
import SparklesIcon from './icons/SparklesIcon';

const AiQuote: React.FC = () => {
  const [quote, setQuote] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getQuote = async () => {
      setIsLoading(true);
      const fetchedQuote = await fetchInspirationalQuote();
      setQuote(fetchedQuote);
      setIsLoading(false);
    };
    getQuote();
  }, []);

  return (
    <Slide title="今日の言葉" icon={<SparklesIcon className="w-7 h-7" />}>
      <div className="flex items-center justify-center h-full">
        {isLoading ? (
          <div className="text-slate-400">Loading...</div>
        ) : (
          <blockquote className="text-center">
            <p className="text-3xl font-semibold italic text-slate-100 leading-relaxed">
              "{quote}"
            </p>
          </blockquote>
        )}
      </div>
    </Slide>
  );
};

export default AiQuote;
