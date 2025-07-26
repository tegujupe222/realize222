import React from 'react';
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todaysEvents = events.filter(e => {
      const eventStart = new Date(e.start);
      return eventStart >= today && eventStart < tomorrow;
  });

  const pendingTasks = tasks.filter(t => !t.completed);
  const importantAnnouncements = announcements.filter(a => a.type === 'Important');
  const regularAnnouncements = announcements.filter(a => a.type !== 'Important');

  const briefing = `おはようございます！今日も一日頑張りましょう。

**今日の予定**
${todaysEvents.length > 0 ? todaysEvents.map(e => `- ${e.title} (${e.isAllDay ? '終日' : e.start.toLocaleTimeString('ja-JP', {hour: '2-digit', minute:'2-digit'})})`).join('\n') : '- 予定はありません'}

**お知らせ**
${importantAnnouncements.length > 0 ? importantAnnouncements.map(a => `- ${a.title} (重要)`).join('\n') : ''}
${regularAnnouncements.length > 0 ? regularAnnouncements.map(a => `- ${a.title}`).join('\n') : ''}
${importantAnnouncements.length === 0 && regularAnnouncements.length === 0 ? '- お知らせはありません' : ''}

**リマインダー**
- 未完了タスク: ${pendingTasks.length}件

今日も素晴らしい一日になりますように！`;

  return (
    <Slide title="今日のブリーフィング" icon={<ClipboardListIcon className="w-7 h-7" />}>
      <div className="h-full">
          <div className="prose prose-invert prose-p:text-slate-300 prose-strong:text-teal-300 text-slate-300">
             <SimpleMarkdown text={briefing} />
          </div>
      </div>
    </Slide>
  );
};

export default DailyBriefing;
