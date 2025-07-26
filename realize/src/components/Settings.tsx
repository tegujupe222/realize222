import React, { useState, useMemo, useRef } from 'react';
import { Member, Task, Status, TimetableEntry, TimeSlot, Announcement, AnnouncementType, ScheduleEvent } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import Modal from './Modal';
import CheckIcon from './icons/CheckIcon';
import UploadCloudIcon from './icons/UploadCloudIcon';

type SettingsProps = {
  setView: (view: 'dashboard' | 'settings') => void;
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  timetables: TimetableEntry[];
  setTimetables: React.Dispatch<React.SetStateAction<TimetableEntry[]>>;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  scheduleEvents: ScheduleEvent[];
  setScheduleEvents: React.Dispatch<React.SetStateAction<ScheduleEvent[]>>;
};

type ActiveTab = 'members' | 'tasks' | 'schedule' | 'announcements' | 'timetable';

const Settings: React.FC<SettingsProps> = (props) => {
  const { setView, members, setMembers, tasks, setTasks, timetables, setTimetables, announcements, setAnnouncements, scheduleEvents, setScheduleEvents } = props;
  const [activeTab, setActiveTab] = useState<ActiveTab>('members');
  
  // Member state
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [newMemberName, setNewMemberName] = useState('');

  // Task state
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskMemberId, setNewTaskMemberId] = useState<string>(members[0]?.id || '');

  // Announcement state
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // Schedule state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  
  // Timetable state
  const [selectedTimetableMemberId, setSelectedTimetableMemberId] = useState<string>(members[0]?.id || '');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Member Handlers ---
  const handleOpenEditMemberModal = (member: Member) => {
    setEditingMember(member);
    setIsEditMemberModalOpen(true);
  };
  const handleUpdateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    setIsEditMemberModalOpen(false);
    setEditingMember(null);
  }
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName.trim() === '') return;
    const newMemberId = Date.now().toString();
    const newMember: Member = { id: newMemberId, name: newMemberName.trim(), avatar: `https://i.pravatar.cc/150?u=${newMemberId}`, status: Status.AVAILABLE };
    setMembers(prev => [...prev, newMember]);
    setTimetables(prev => [...prev, { memberId: newMemberId, timetable: [] }]);
    setNewMemberName('');
    if (!newTaskMemberId) setNewTaskMemberId(newMemberId);
  };
  const handleDeleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setTasks(prev => prev.filter(t => t.memberId !== id));
    setTimetables(prev => prev.filter(t => t.memberId !== id));
  };
  
  // --- Task Handlers ---
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() === '' || !newTaskMemberId) return;
    const newTask: Task = { id: 't' + Date.now().toString(), text: newTaskText.trim(), completed: false, memberId: newTaskMemberId };
    setTasks(prev => [...prev, newTask]);
    setNewTaskText('');
  };
  const handleDeleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  const handleToggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  
  // --- Announcement Handlers ---
  const handleOpenAnnouncementModal = (announcement: Announcement | null = null) => {
    setEditingAnnouncement(announcement);
    setIsAnnouncementModalOpen(true);
  }
  const handleSaveAnnouncement = (announcement: Announcement) => {
    if (editingAnnouncement) { // Update existing
      setAnnouncements(prev => prev.map(a => a.id === announcement.id ? announcement : a));
    } else { // Add new
      setAnnouncements(prev => [...prev, { ...announcement, id: 'a' + Date.now().toString() }]);
    }
    setIsAnnouncementModalOpen(false);
    setEditingAnnouncement(null);
  }
  const handleDeleteAnnouncement = (id: string) => setAnnouncements(prev => prev.filter(a => a.id !== id));
  
  // --- Schedule Handlers ---
  const handleOpenScheduleModal = (event: ScheduleEvent | null = null) => {
    setEditingEvent(event);
    setIsScheduleModalOpen(true);
  };
  const handleSaveScheduleEvent = (event: ScheduleEvent) => {
    if (editingEvent) {
      setScheduleEvents(prev => prev.map(e => (e.id === event.id ? event : e)));
    } else {
      setScheduleEvents(prev => [...prev, { ...event, id: 'e' + Date.now().toString() }]);
    }
    setIsScheduleModalOpen(false);
    setEditingEvent(null);
  };
  const handleDeleteScheduleEvent = (id: string) => {
    setScheduleEvents(prev => prev.filter(e => e.id !== id));
  };


  // --- Timetable Handlers ---
  const handleTimetableChange = (memberId: string, slotIndex: number, field: keyof TimeSlot, value: string) => {
    setTimetables(prev => prev.map(entry => entry.memberId === memberId ? { ...entry, timetable: entry.timetable.map((slot, i) => i === slotIndex ? { ...slot, [field]: value } : slot) } : entry));
  };
  const handleAddTimetableSlot = (memberId: string) => {
    setTimetables(prev => prev.map(entry => entry.memberId === memberId ? { ...entry, timetable: [...entry.timetable, { period: `${entry.timetable.length + 1}`, time: '', subject: '', class: ''}] } : entry));
  };
  const handleDeleteTimetableSlot = (memberId: string, slotIndex: number) => {
    setTimetables(prev => prev.map(entry => entry.memberId === memberId ? { ...entry, timetable: entry.timetable.filter((_, i) => i !== slotIndex) } : entry));
  };
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsParsing(true);
    setParseError(null);
    try {
        // PDF解析機能を無効化
        setParseError("PDF解析機能は現在利用できません。");
        setIsParsing(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
    } catch (error) {
        console.error("PDF Parsing failed:", error);
        setParseError(error instanceof Error ? error.message : "An unknown error occurred during PDF parsing.");
    } finally {
        setIsParsing(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
    }
  };

  const currentTimetable = useMemo(() => timetables.find(t => t.memberId === selectedTimetableMemberId), [timetables, selectedTimetableMemberId]);

  const TabButton: React.FC<{tab: ActiveTab, label: string}> = ({ tab, label }) => (
    <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tab ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
        {label}
    </button>
  );

  return (
    <>
      <div className="bg-slate-900 min-h-screen text-white p-6 sm:p-8 flex flex-col fade-in">
          <header className="flex items-center gap-4 mb-8">
              <button onClick={() => setView('dashboard')} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors" aria-label="ダッシュボードに戻る">
                  <ArrowLeftIcon className="w-6 h-6 text-slate-300"/>
              </button>
              <h1 className="text-3xl font-bold text-slate-100">設定</h1>
          </header>

          <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-6 flex-grow flex flex-col">
              <nav className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4 overflow-x-auto">
                  <TabButton tab="members" label="メンバー管理" />
                  <TabButton tab="tasks" label="タスク管理" />
                  <TabButton tab="schedule" label="予定管理" />
                  <TabButton tab="announcements" label="お知らせ管理" />
                  <TabButton tab="timetable" label="時間割の編集" />
              </nav>

              <div className="flex-grow overflow-y-auto pr-2">
                  {activeTab === 'members' && (
                     <div>
                          <h2 className="text-xl font-bold text-slate-200 mb-4">メンバー一覧</h2>
                          <form onSubmit={handleAddMember} className="flex gap-2 mb-6">
                              <input type="text" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} placeholder="新しいメンバー名" className="flex-grow bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                              <button type="submit" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors"><PlusIcon className="w-5 h-5"/>追加</button>
                          </form>
                          <ul className="space-y-2">
                              {members.map(member => (
                                  <li key={member.id} className="flex items-center justify-between bg-slate-900/70 p-3 rounded-md">
                                      <div className="flex items-center gap-3">
                                          <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full border-2 border-slate-600" />
                                          <div>
                                            <span className="font-medium text-slate-200">{member.name}</span>
                                            <p className="text-xs text-slate-400">{member.status}</p>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button onClick={() => handleOpenEditMemberModal(member)} className="p-2 rounded-md hover:bg-teal-500/20 text-slate-500 hover:text-teal-400 transition-colors" aria-label={`${member.name}を編集`}>
                                            <EditIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDeleteMember(member.id)} className="p-2 rounded-md hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors" aria-label={`${member.name}を削除`}>
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                      </div>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  )}
                  {activeTab === 'tasks' && (
                       <div>
                          <h2 className="text-xl font-bold text-slate-200 mb-4">タスク一覧</h2>
                           <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
                              <input type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="新しいタスクの内容" className="md:col-span-2 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                              <div className="flex gap-2">
                                  <select value={newTaskMemberId} onChange={e => setNewTaskMemberId(e.target.value)} className="flex-grow bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={members.length === 0}>
                                      {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                  </select>
                                  <button type="submit" className="flex items-center justify-center bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3 rounded-md transition-colors w-14" aria-label="タスクを追加" disabled={members.length === 0}><PlusIcon className="w-5 h-5"/></button>
                              </div>
                          </form>
                          <div className="space-y-4">
                              {members.map(member => (
                                  <div key={`task-group-${member.id}`}>
                                      <h3 className="font-bold text-teal-300 mb-2">{member.name}</h3>
                                      <ul className="space-y-2">
                                          {tasks.filter(t => t.memberId === member.id).map(task => (
                                              <li key={task.id} className="flex items-center justify-between bg-slate-900/70 p-3 rounded-md text-sm">
                                                  <div className="flex items-center gap-3">
                                                    <button onClick={() => handleToggleTask(task.id)} className={`w-5 h-5 rounded-sm flex-shrink-0 flex items-center justify-center border-2 transition-colors ${task.completed ? 'bg-teal-500 border-teal-500' : 'border-slate-500'}`} aria-label="タスクの完了状態を切り替え">
                                                      {task.completed && <CheckIcon className="w-4 h-4 text-white" />}
                                                    </button>
                                                    <span className={`${task.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{task.text}</span>
                                                  </div>
                                                  <button onClick={() => handleDeleteTask(task.id)} className="p-2 rounded-md hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors" aria-label={`タスク「${task.text}」を削除`}>
                                                      <TrashIcon className="w-5 h-5" />
                                                  </button>
                                              </li>
                                          ))}
                                          {tasks.filter(t => t.memberId === member.id).length === 0 && <p className="text-slate-500 italic text-sm">タスクはありません。</p>}
                                      </ul>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
                  {activeTab === 'schedule' && (
                     <div>
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-200">予定一覧</h2>
                            <button onClick={() => handleOpenScheduleModal()} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors"><PlusIcon className="w-5 h-5"/>新規作成</button>
                          </div>
                          <ul className="space-y-3">
                            {scheduleEvents.sort((a,b) => a.start.getTime() - b.start.getTime()).map(event => (
                              <li key={event.id} className="bg-slate-900/70 p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-bold text-slate-200">{event.title}</h3>
                                    <p className="text-sm text-slate-400 mt-1">
                                      {event.start.toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' })} - {event.end.toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' })}
                                      {event.isAllDay && <span className="text-xs ml-2 bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">終日</span>}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                    <button onClick={() => handleOpenScheduleModal(event)} className="p-2 rounded-md hover:bg-teal-500/20 text-slate-500 hover:text-teal-400 transition-colors" aria-label="予定を編集">
                                      <EditIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDeleteScheduleEvent(event.id)} className="p-2 rounded-md hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors" aria-label="予定を削除">
                                      <TrashIcon className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                      </div>
                  )}
                   {activeTab === 'announcements' && (
                      <div>
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-200">お知らせ一覧</h2>
                            <button onClick={() => handleOpenAnnouncementModal()} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors"><PlusIcon className="w-5 h-5"/>新規作成</button>
                          </div>
                          <ul className="space-y-3">
                            {announcements.map(announcement => (
                              <li key={announcement.id} className="bg-slate-900/70 p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${announcement.type === AnnouncementType.IMPORTANT ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}>{announcement.type}</span>
                                    <h3 className="font-bold text-slate-200 mt-2">{announcement.title}</h3>
                                    <p className="text-sm text-slate-400 mt-1">{announcement.content}</p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                    <button onClick={() => handleOpenAnnouncementModal(announcement)} className="p-2 rounded-md hover:bg-teal-500/20 text-slate-500 hover:text-teal-400 transition-colors" aria-label="お知らせを編集">
                                      <EditIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDeleteAnnouncement(announcement.id)} className="p-2 rounded-md hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors" aria-label="お知らせを削除">
                                      <TrashIcon className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                      </div>
                  )}
                  {activeTab === 'timetable' && (
                      <div>
                          <h2 className="text-xl font-bold text-slate-200 mb-4">時間割の編集</h2>
                          <div className="mb-6 p-4 bg-slate-900/50 rounded-lg">
                            <label htmlFor="member-select" className="block text-sm font-medium text-slate-300 mb-2">編集するメンバーを選択</label>
                            <select id="member-select" value={selectedTimetableMemberId} onChange={e => setSelectedTimetableMemberId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={members.length === 0}>
                                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                            <div className="mt-4">
                                <label htmlFor="pdf-upload" className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-colors ${isParsing ? 'bg-slate-600 text-slate-400' : 'bg-teal-600 hover:bg-teal-500 text-white'}`}>
                                    <UploadCloudIcon className="w-6 h-6" />
                                    <span className="font-semibold">{isParsing ? 'AIが解析中...' : 'PDFから時間割を自動入力'}</span>
                                </label>
                                <input id="pdf-upload" type="file" accept=".pdf" ref={fileInputRef} onChange={handlePdfUpload} className="hidden" disabled={isParsing || members.length === 0} />
                                {parseError && <p className="text-red-400 text-sm mt-2">{parseError}</p>}
                            </div>
                          </div>
                          
                          {currentTimetable && (
                            <div className="space-y-2">
                              {currentTimetable.timetable.map((slot, index) => (
                                <div key={index} className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto] gap-2 items-center bg-slate-900/70 p-2 rounded-md">
                                  <span className="font-bold text-slate-300 px-2">{index + 1}</span>
                                  <input type="text" placeholder="時限" value={slot.period} onChange={(e) => handleTimetableChange(selectedTimetableMemberId, index, 'period', e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm w-full" />
                                  <input type="text" placeholder="時間" value={slot.time} onChange={(e) => handleTimetableChange(selectedTimetableMemberId, index, 'time', e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm w-full" />
                                  <input type="text" placeholder="教科" value={slot.subject} onChange={(e) => handleTimetableChange(selectedTimetableMemberId, index, 'subject', e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm w-full" />
                                  <input type="text" placeholder="クラス" value={slot.class} onChange={(e) => handleTimetableChange(selectedTimetableMemberId, index, 'class', e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm w-full" />
                                  <button onClick={() => handleDeleteTimetableSlot(selectedTimetableMemberId, index)} className="p-2 rounded-md hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors" aria-label="このコマを削除">
                                    <TrashIcon className="w-5 h-5"/>
                                  </button>
                                </div>
                              ))}
                               <button onClick={() => handleAddTimetableSlot(selectedTimetableMemberId)} className="mt-4 flex items-center gap-2 bg-teal-600/50 hover:bg-teal-600/80 text-white font-bold py-2 px-4 rounded-md transition-colors w-full justify-center" disabled={members.length === 0}>
                                <PlusIcon className="w-5 h-5"/>コマを追加
                              </button>
                            </div>
                          )}
                      </div>
                  )}
              </div>
          </div>
          <footer className="text-center mt-6">
              <p className="text-xs text-slate-500">注: 設定の変更は自動的に保存されます。</p>
          </footer>
      </div>

      {isEditMemberModalOpen && editingMember && (
        <MemberEditModal 
          isOpen={isEditMemberModalOpen} 
          onClose={() => setIsEditMemberModalOpen(false)}
          member={editingMember}
          onSave={handleUpdateMember}
        />
      )}
      {isAnnouncementModalOpen && (
        <AnnouncementEditModal
          isOpen={isAnnouncementModalOpen}
          onClose={() => setIsAnnouncementModalOpen(false)}
          announcement={editingAnnouncement}
          onSave={handleSaveAnnouncement}
        />
      )}
      {isScheduleModalOpen && (
        <ScheduleEditModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          event={editingEvent}
          onSave={handleSaveScheduleEvent}
        />
      )}
    </>
  );
};

// --- Modals ---

type MemberEditModalProps = { isOpen: boolean; onClose: () => void; member: Member; onSave: (member: Member) => void; }
const MemberEditModal: React.FC<MemberEditModalProps> = ({ isOpen, onClose, member, onSave }) => {
  const [name, setName] = useState(member.name);
  const [status, setStatus] = useState(member.status);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ ...member, name, status }); };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="メンバー情報の編集">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="memberName" className="block text-sm font-medium text-slate-400 mb-1">名前</label>
              <input id="memberName" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label htmlFor="memberStatus" className="block text-sm font-medium text-slate-400 mb-1">ステータス</label>
              <select id="memberStatus" value={status} onChange={e => setStatus(e.target.value as Status)} className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors text-sm font-semibold">キャンセル</button>
              <button type="submit" className="py-2 px-4 bg-teal-600 hover:bg-teal-500 rounded-md transition-colors text-sm font-semibold">保存</button>
            </div>
        </form>
    </Modal>
  )
}

type AnnouncementEditModalProps = { isOpen: boolean; onClose: () => void; announcement: Announcement | null; onSave: (announcement: Announcement) => void; }
const AnnouncementEditModal: React.FC<AnnouncementEditModalProps> = ({ isOpen, onClose, announcement, onSave }) => {
  const [title, setTitle] = useState(announcement?.title || '');
  const [content, setContent] = useState(announcement?.content || '');
  const [type, setType] = useState(announcement?.type || AnnouncementType.NORMAL);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ id: announcement?.id || '', title, content, type });
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={announcement ? "お知らせの編集" : "新規お知らせ作成"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="announcementTitle" className="block text-sm font-medium text-slate-400 mb-1">タイトル</label>
          <input id="announcementTitle" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" required />
        </div>
        <div>
          <label htmlFor="announcementContent" className="block text-sm font-medium text-slate-400 mb-1">内容</label>
          <textarea id="announcementContent" value={content} onChange={e => setContent(e.target.value)} rows={4} className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label htmlFor="announcementType" className="block text-sm font-medium text-slate-400 mb-1">種別</label>
          <select id="announcementType" value={type} onChange={e => setType(e.target.value as AnnouncementType)} className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
            {Object.values(AnnouncementType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors text-sm font-semibold">キャンセル</button>
          <button type="submit" className="py-2 px-4 bg-teal-600 hover:bg-teal-500 rounded-md transition-colors text-sm font-semibold">保存</button>
        </div>
      </form>
    </Modal>
  )
}

type ScheduleEditModalProps = { isOpen: boolean; onClose: () => void; event: ScheduleEvent | null; onSave: (event: ScheduleEvent) => void; }
const ScheduleEditModal: React.FC<ScheduleEditModalProps> = ({ isOpen, onClose, event, onSave }) => {
  const [title, setTitle] = useState(event?.title || '');
  const [startDate, setStartDate] = useState(event ? new Date(event.start.getTime() - event.start.getTimezoneOffset() * 60000).toISOString().substring(0, 10) : '');
  const [startTime, setStartTime] = useState(event ? new Date(event.start.getTime() - event.start.getTimezoneOffset() * 60000).toISOString().substring(11, 16) : '');
  const [endDate, setEndDate] = useState(event ? new Date(event.end.getTime() - event.end.getTimezoneOffset() * 60000).toISOString().substring(0, 10) : '');
  const [endTime, setEndTime] = useState(event ? new Date(event.end.getTime() - event.end.getTimezoneOffset() * 60000).toISOString().substring(11, 16) : '');
  const [isAllDay, setIsAllDay] = useState(event?.isAllDay || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) return;

    const start = new Date(`${startDate}T${isAllDay ? '00:00:00' : startTime || '00:00:00'}`);
    const end = new Date(`${endDate || startDate}T${isAllDay ? '23:59:59' : endTime || startTime || '00:00:00'}`);
    
    onSave({ id: event?.id || '', title, start, end, isAllDay });
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event ? "予定の編集" : "新規予定作成"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="eventTitle" className="block text-sm font-medium text-slate-400 mb-1">タイトル</label>
          <input id="eventTitle" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="eventStartDate" className="block text-sm font-medium text-slate-400 mb-1">開始日</label>
            <input id="eventStartDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" required />
          </div>
          <div className={isAllDay ? 'hidden' : ''}>
            <label htmlFor="eventStartTime" className="block text-sm font-medium text-slate-400 mb-1">開始時間</label>
            <input id="eventStartTime" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        <div className={`grid grid-cols-2 gap-4 ${isAllDay ? 'hidden' : ''}`}>
          <div>
            <label htmlFor="eventEndDate" className="block text-sm font-medium text-slate-400 mb-1">終了日</label>
            <input id="eventEndDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label htmlFor="eventEndTime" className="block text-sm font-medium text-slate-400 mb-1">終了時間</label>
            <input id="eventEndTime" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <input id="allDay" type="checkbox" checked={isAllDay} onChange={e => setIsAllDay(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-teal-600 focus:ring-teal-500" />
            <label htmlFor="allDay" className="text-sm text-slate-300">終日</label>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors text-sm font-semibold">キャンセル</button>
          <button type="submit" className="py-2 px-4 bg-teal-600 hover:bg-teal-500 rounded-md transition-colors text-sm font-semibold">保存</button>
        </div>
      </form>
    </Modal>
  )
}

export default Settings;
