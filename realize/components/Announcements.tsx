import React from 'react';
import { Announcement, AnnouncementType } from '../types';
import Slide from './Slide';
import MegaphoneIcon from './icons/MegaphoneIcon';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

interface AnnouncementsProps {
  announcements: Announcement[];
}

const AnnouncementItem: React.FC<{ announcement: Announcement }> = ({ announcement }) => {
  const isImportant = announcement.type === AnnouncementType.IMPORTANT;
  const baseClasses = "bg-slate-900/70 p-4 rounded-lg border-l-4";
  const typeClasses = isImportant 
    ? "border-red-500" 
    : (announcement.type === AnnouncementType.EVENT ? "border-blue-500" : "border-slate-600");

  return (
    <li className={`${baseClasses} ${typeClasses}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-100">{announcement.title}</h3>
        {isImportant && <AlertTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />}
      </div>
      <p className="text-slate-300 mt-2 text-sm">{announcement.content}</p>
    </li>
  );
};

const Announcements: React.FC<AnnouncementsProps> = ({ announcements }) => {
    // Sort announcements to show important ones first
    const sortedAnnouncements = [...announcements].sort((a, b) => {
        if (a.type === AnnouncementType.IMPORTANT && b.type !== AnnouncementType.IMPORTANT) return -1;
        if (a.type !== AnnouncementType.IMPORTANT && b.type === AnnouncementType.IMPORTANT) return 1;
        return 0;
    });

  return (
    <Slide title="お知らせ" icon={<MegaphoneIcon className="w-7 h-7" />}>
      {sortedAnnouncements.length > 0 ? (
        <ul className="space-y-4">
          {sortedAnnouncements.map(announcement => (
            <AnnouncementItem key={announcement.id} announcement={announcement} />
          ))}
        </ul>
      ) : (
        <div className="flex items-center justify-center h-full">
            <p className="text-slate-400 text-center">現在、新しいお知らせはありません。</p>
        </div>
      )}
    </Slide>
  );
};

export default Announcements;
