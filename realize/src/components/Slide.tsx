
import React from 'react';

interface SlideProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Slide: React.FC<SlideProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-6 h-full flex flex-col fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-teal-400">{icon}</div>
        <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
      </div>
      <div className="flex-grow overflow-y-auto pr-2">
        {children}
      </div>
    </div>
  );
};

export default Slide;
