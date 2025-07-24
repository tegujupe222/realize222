
import React from 'react';
import { ScheduleEvent } from '../types';
import Slide from './Slide';
import CalendarIcon from './icons/CalendarIcon';

interface WeeklyScheduleProps {
  events: ScheduleEvent[];
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit', weekday: 'short' });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ events }) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const endOfNextWeek = new Date(today);
  endOfNextWeek.setDate(today.getDate() + (6 - today.getDay()) + 7);

  const relevantEvents = events
    .filter(event => event.start >= today && event.start <= endOfNextWeek)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  return (
    <Slide title="週間予定" icon={<CalendarIcon className="w-7 h-7" />}>
      <div className="space-y-4">
        {relevantEvents.length > 0 ? (
          relevantEvents.map(event => (
            <div key={event.id} className="flex items-start gap-4 p-3 bg-slate-900/70 rounded-lg">
              <div className="text-center w-20 flex-shrink-0">
                <p className="font-bold text-teal-300">{formatDate(event.start)}</p>
              </div>
              <div className="border-l-2 border-teal-500 pl-4 flex-grow">
                <p className="font-bold text-slate-100">{event.title}</p>
                <p className="text-sm text-slate-400">
                  {event.isAllDay ? '終日' : `${formatTime(event.start)} - ${formatTime(event.end)}`}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-400 text-center py-8">今週と来週の予定はありません。</p>
        )}
      </div>
    </Slide>
  );
};

export default WeeklySchedule;
