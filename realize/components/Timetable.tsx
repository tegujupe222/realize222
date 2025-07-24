
import React from 'react';
import { TimetableEntry, Member } from '../types';
import Slide from './Slide';
import UsersIcon from './icons/UsersIcon';

interface TimetableProps {
  timetables: TimetableEntry[];
  members: Member[];
}

const Timetable: React.FC<TimetableProps> = ({ timetables, members }) => {
  const getMemberName = (memberId: string) => {
    return members.find(m => m.id === memberId)?.name || 'Unknown';
  };

  return (
    <Slide title="本日の時間割" icon={<UsersIcon className="w-7 h-7" />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {timetables.map(entry => (
          <div key={entry.memberId} className="bg-slate-900/70 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-teal-300 mb-3">{getMemberName(entry.memberId)}</h3>
            <ul className="space-y-2">
              {entry.timetable.map(slot => (
                <li key={slot.period} className="flex items-center text-slate-300 text-sm">
                  <span className="font-bold text-slate-100 w-12">{slot.period}限</span>
                  <span className="text-slate-400 w-28">[{slot.time}]</span>
                  <span className="flex-1 font-semibold text-slate-200">{slot.subject}</span>
                  <span className="text-xs text-slate-400">{slot.class}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Slide>
  );
};

export default Timetable;
