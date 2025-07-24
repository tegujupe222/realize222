import React, { useState, useEffect } from 'react';
import { generateDailyBriefing } from '../services/geminiService';
import Slide from './Slide';
import { Task, ScheduleEvent, Announcement } from '../types';
import ClipboardListIcon from './icons/ClipboardListIcon';

interface DailyBriefingProps {
    tasks: Task[];
    events: ScheduleEvent[];
    announcements: Announcement[];
}

const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n').map((line) => {
    // Bold: **text**
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-teal-300">$1</strong>');
    
    // Simple list items
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      return `<li class="ml-4 list-disc list-inside">${line.substring(line.indexOf(' ')+1)}</li>`;
    }
    
    return `<p>${line}</p>`;
  });

  return <div className="space-y-2" dangerouslySetInnerHTML={{ __html: lines.join('') }} />;
};


const DailyBriefing: React.FC<DailyBriefingProps> = ({ tasks, events, announcements }) => {
  const [briefing, setBriefing] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getBriefing = async () => {
      setIsLoading(true);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const todaysEvents = events.filter(e => {
            const eventStart = new Date(e.start);
            return eventStart >= today && eventStart < tomorrow;
        });

        const fetchedBriefing = await generateDailyBriefing({ tasks, events: todaysEvents, announcements });
        setBriefing(fetchedBriefing);
      } catch (error) {
        console.error(error);
        setBriefing("本日のブリーフィングの取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };
    getBriefing();
  }, [tasks, events, announcements]);

  return (
    <Slide title="今日のブリーフィング" icon={<ClipboardListIcon className="w-7 h-7" />}>
      <div className="h-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="flex flex-col items-center gap-2">
                <svg className="animate-spin h-8 w-8 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>AIが今日のまとめを作成中...</span>
            </div>
          </div>
        ) : (
          <div className="prose prose-invert prose-p:text-slate-300 prose-strong:text-teal-300 text-slate-300">
             <SimpleMarkdown text={briefing} />
          </div>
        )}
      </div>
    </Slide>
  );
};

export default DailyBriefing;
