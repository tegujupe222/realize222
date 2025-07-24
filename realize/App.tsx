import React, { useState, useEffect } from 'react';
import Clock from './components/Clock';
import Timetable from './components/Timetable';
import WeeklySchedule from './components/WeeklySchedule';
import TodoList from './components/TodoList';
import AiQuote from './components/AiQuote';
import Announcements from './components/Announcements';
import DailyBriefing from './components/DailyBriefing';
import AiChat from './components/AiChat';
import Settings from './components/Settings';
import LoginScreen from './components/LoginScreen';
import { useSlideshow } from './hooks/useSlideshow';
import { MEMBERS, TASKS, TIMETABLES, SCHEDULE_EVENTS, ANNOUNCEMENTS } from './constants';
import SettingsIcon from './components/icons/SettingsIcon';
import LogoutIcon from './components/icons/LogoutIcon';
import { Member, Task, TimetableEntry, Announcement, ScheduleEvent } from './types';
import { useAuth } from './contexts/AuthContext';

const SLIDE_INTERVAL_SECONDS = 15;

// Generic hook to use state with localStorage
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const stickyValue = window.localStorage.getItem(key);
    try {
      if (stickyValue === null) {
        return defaultValue;
      }
      // Date objects need to be revived from string representation
      if (key === 'realize-schedule' && stickyValue) {
        const parsed = JSON.parse(stickyValue);
        return parsed.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        })) as T;
      }
      return JSON.parse(stickyValue);
    } catch (error) {
      console.warn(`Error parsing JSON from localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}


const App: React.FC = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState<'dashboard' | 'settings'>('dashboard');
  const [members, setMembers] = useStickyState<Member[]>(MEMBERS, 'realize-members');
  const [tasks, setTasks] = useStickyState<Task[]>(TASKS, 'realize-tasks');
  const [timetables, setTimetables] = useStickyState<TimetableEntry[]>(TIMETABLES, 'realize-timetables');
  const [announcements, setAnnouncements] = useStickyState<Announcement[]>(ANNOUNCEMENTS, 'realize-announcements');
  const [scheduleEvents, setScheduleEvents] = useStickyState<ScheduleEvent[]>(SCHEDULE_EVENTS, 'realize-schedule');
  
  const slides = [
    <DailyBriefing key="briefing" tasks={tasks} events={scheduleEvents} announcements={announcements} />,
    <Timetable key="timetable" timetables={timetables} members={members} />,
    <AiChat key="aichat" members={members} tasks={tasks} timetables={timetables} events={scheduleEvents} announcements={announcements} />,
    <Announcements key="announcements" announcements={announcements} />,
    <TodoList key="todolist" members={members} tasks={tasks} setTasks={setTasks} />,
    <WeeklySchedule key="schedule" events={scheduleEvents} />,
    <AiQuote key="aiquote" />,
  ];

  const [ActiveSlide, activeIndex] = useSlideshow<React.ReactNode>(slides, SLIDE_INTERVAL_SECONDS);

  if (!user) {
    return <LoginScreen />;
  }

  if (view === 'settings') {
    return <Settings 
      setView={setView} 
      members={members}
      setMembers={setMembers}
      tasks={tasks}
      setTasks={setTasks}
      timetables={timetables}
      setTimetables={setTimetables}
      announcements={announcements}
      setAnnouncements={setAnnouncements}
      scheduleEvents={scheduleEvents}
      setScheduleEvents={setScheduleEvents}
    />;
  }

  return (
    <main className="bg-slate-900 min-h-screen text-white p-6 sm:p-8 flex flex-col">
      <div 
        className="fixed inset-0 -z-10 h-full w-full bg-slate-900 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"
      >
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-teal-400 opacity-20 blur-[100px]"></div>
      </div>
      
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">realize</h1>
          <p className="text-slate-400">職員室ダッシュボード</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
                <img src={user.picture} alt={user.name} className="w-11 h-11 rounded-full border-2 border-slate-600"/>
                <div>
                  <p className="font-semibold text-slate-100 text-sm whitespace-nowrap">{user.name}</p>
                  <button onClick={logout} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors">
                    <LogoutIcon className="w-3 h-3" />
                    ログアウト
                  </button>
                </div>
            </div>
            <div className="h-10 w-px bg-slate-700" />
            <button onClick={() => setView('settings')} className="text-slate-400 hover:text-white transition-colors" aria-label="設定を開く">
                <SettingsIcon className="w-6 h-6" />
            </button>
            <Clock />
        </div>
      </header>

      <section className="flex-grow">
        {ActiveSlide}
      </section>

      <footer className="w-full mt-6">
        <div className="flex justify-center items-center gap-3">
            {slides.map((_, index) => (
                <div 
                    key={index} 
                    className={`h-2 rounded-full transition-all duration-300 ${activeIndex === index ? 'bg-teal-400 w-8' : 'bg-slate-600 w-2'}`}
                />
            ))}
        </div>
      </footer>
    </main>
  );
};

export default App;
