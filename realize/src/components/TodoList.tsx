import React from 'react';
import { Member, Task, Status } from '../types';
import Slide from './Slide';
import ListChecksIcon from './icons/ListChecksIcon';
import CheckIcon from './icons/CheckIcon';

interface TodoListProps {
  members: Member[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const statusStyles: { [key in Status]: string } = {
    [Status.AVAILABLE]: 'bg-green-500/20 text-green-300',
    [Status.MEETING]: 'bg-purple-500/20 text-purple-300',
    [Status.OUT_OF_OFFICE]: 'bg-gray-500/20 text-gray-300',
    [Status.ON_BREAK]: 'bg-yellow-500/20 text-yellow-300',
    [Status.CLUB_ACTIVITY]: 'bg-blue-500/20 text-blue-300',
    [Status.BUSINESS_TRIP]: 'bg-orange-500/20 text-orange-300',
  };
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>{status}</span>;
}

const TodoList: React.FC<TodoListProps> = ({ members, tasks, setTasks }) => {
  
  const handleToggleTask = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <Slide title="メンバー状況 & ToDo" icon={<ListChecksIcon className="w-7 h-7" />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {members.map(member => {
          const memberTasks = tasks.filter(task => task.memberId === member.id);
          return (
            <div key={member.id} className="bg-slate-900/70 p-4 rounded-lg flex flex-col">
              <div className="flex items-center mb-4">
                <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full mr-4 border-2 border-slate-600"/>
                <div className="flex-grow">
                  <h3 className="font-bold text-slate-100">{member.name}</h3>
                   <StatusBadge status={member.status} />
                </div>
              </div>
              <ul className="space-y-2 flex-grow">
                {memberTasks.length > 0 ? (
                  memberTasks.map(task => (
                    <li key={task.id} className={`flex items-center gap-3 text-sm transition-colors ${task.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                      <button 
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-5 h-5 rounded-sm flex-shrink-0 flex items-center justify-center transition-all ${task.completed ? 'bg-teal-500 border-teal-500' : 'border-2 border-slate-500 hover:border-teal-400'}`}
                        aria-label={`Mark task as ${task.completed ? 'incomplete' : 'complete'}`}
                      >
                        {task.completed && <CheckIcon className="w-4 h-4 text-slate-900" />}
                      </button>
                      <span className="cursor-pointer" onClick={() => handleToggleTask(task.id)}>{task.text}</span>
                    </li>
                  ))
                 ) : (
                    <p className="text-sm text-slate-500 italic">No tasks assigned.</p>
                 )}
              </ul>
            </div>
          );
        })}
      </div>
    </Slide>
  );
};

export default TodoList;
