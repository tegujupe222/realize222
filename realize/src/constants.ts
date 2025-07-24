import { Member, Task, TimetableEntry, ScheduleEvent, Status, Announcement, AnnouncementType } from './types';

export const MEMBERS: Member[] = [
  { id: '1', name: '佐藤 健太', avatar: 'https://i.pravatar.cc/150?u=sato', status: Status.AVAILABLE },
  { id: '2', name: '鈴木 優子', avatar: 'https://i.pravatar.cc/150?u=suzuki', status: Status.MEETING },
  { id: '3', name: '高橋 涼介', avatar: 'https://i.pravatar.cc/150?u=takahashi', status: Status.CLUB_ACTIVITY },
  { id: '4', name: '田中 美咲', avatar: 'https://i.pravatar.cc/150?u=tanaka', status: Status.BUSINESS_TRIP },
];

export const TASKS: Task[] = [
  { id: 't1', text: 'Prepare for next week\'s science experiment', completed: false, memberId: '1' },
  { id: 't2', text: 'Grade midterm exams', completed: true, memberId: '1' },
  { id: 't3', text: 'Update parent contact list', completed: false, memberId: '2' },
  { id: 't4', text: 'Plan for the upcoming school festival', completed: false, memberId: '3' },
  { id: 't5', text: 'Finalize basketball club tournament entry', completed: true, memberId: '3' },
  { id: 't6', text: 'Submit budget report', completed: false, memberId: '4' },
];

export const TIMETABLES: TimetableEntry[] = [
  {
    memberId: '1',
    timetable: [
      { period: '1', time: '09:00 - 09:50', subject: 'Science', class: 'Class 2-A' },
      { period: '2', time: '10:00 - 10:50', subject: 'Prep Time', class: '' },
      { period: '3', time: '11:00 - 11:50', subject: 'Science', class: 'Class 2-C' },
      { period: '4', time: '12:00 - 12:50', subject: 'Science Lab', class: 'Class 2-A' },
    ],
  },
  {
    memberId: '2',
    timetable: [
      { period: '1', time: '09:00 - 09:50', subject: 'Japanese', class: 'Class 1-B' },
      { period: '2', time: '10:00 - 10:50', subject: 'Japanese', class: 'Class 1-C' },
      { period: '3', time: '11:00 - 11:50', subject: 'Prep Time', class: '' },
      { period: '4', time: '12:00 - 12:50', subject: 'Japanese', class: 'Class 1-A' },
    ],
  },
   {
    memberId: '3',
    timetable: [
      { period: '1', time: '09:00 - 09:50', subject: 'P.E.', class: 'Class 3-A' },
      { period: '2', time: '10:00 - 10:50', subject: 'P.E.', class: 'Class 3-B' },
      { period: '3', time: '11:00 - 11:50', subject: 'Prep Time', class: '' },
      { period: '4', time: '12:00 - 12:50', subject: 'Health', class: 'Class 3-C' },
    ],
  },
  {
    memberId: '4',
    timetable: [
      { period: '1', time: '09:00 - 09:50', subject: 'English', class: 'Class 2-B' },
      { period: '2', time: '10:00 - 10:50', subject: 'English', class: 'Class 2-D' },
      { period: '3', time: '11:00 - 11:50', subject: 'English', class: 'Class 2-A' },
      { period: '4', time: '12:00 - 12:50', subject: 'Prep Time', class: '' },
    ],
  },
];

const today = new Date();
const getNextDate = (dayOffset: number) => {
    const date = new Date();
    date.setDate(today.getDate() + dayOffset);
    return date;
}

export const SCHEDULE_EVENTS: ScheduleEvent[] = [
    { id: 'e1', title: 'Department Meeting', start: new Date(today.setHours(16, 0, 0, 0)), end: new Date(today.setHours(17, 0, 0, 0)), isAllDay: false },
    { id: 'e2', title: 'Parent-Teacher Conferences', start: getNextDate(2), end: getNextDate(2), isAllDay: true },
    { id: 'e3', title: 'Midterm Grading Deadline', start: getNextDate(4), end: getNextDate(4), isAllDay: true },
    { id: 'e4', title: 'Faculty Training Workshop', start: getNextDate(8), end: getNextDate(8), isAllDay: false },
    { id: 'e5', title: 'School Sports Festival', start: getNextDate(10), end: getNextDate(11), isAllDay: true },
];

export const ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: '職員会議のお知らせ', content: '来週月曜日の16:00から第1会議室にて定例の職員会議を行います。', type: AnnouncementType.NORMAL },
  { id: 'a2', title: '【重要】避難訓練の実施について', content: '明日10:00より、全校一斉の避難訓練を実施します。指定された避難経路を確認してください。', type: AnnouncementType.IMPORTANT },
  { id: 'a3', title: '球技大会の参加チーム募集', content: '来月開催される球技大会の参加チームを募集します。詳細は体育科の高橋先生まで。', type: AnnouncementType.EVENT },
];
