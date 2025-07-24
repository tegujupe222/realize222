export enum Status {
  AVAILABLE = 'Available',
  MEETING = 'In a Meeting',
  OUT_OF_OFFICE = 'Out of Office',
  ON_BREAK = 'On Break',
  CLUB_ACTIVITY = 'Club Activity',
  BUSINESS_TRIP = 'Business Trip',
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
  status: Status;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  memberId: string;
}

export interface TimeSlot {
  period: string;
  time: string;
  subject: string;
  class: string;
}

export interface TimetableEntry {
  memberId: string;
  timetable: TimeSlot[];
}

export interface ScheduleEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
}

export enum AnnouncementType {
  NORMAL = 'Normal',
  IMPORTANT = 'Important',
  EVENT = 'Event',
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
}

export interface AuthenticatedUser {
  name: string;
  email: string;
  picture: string;
}
