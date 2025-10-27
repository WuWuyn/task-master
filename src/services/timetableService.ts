import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface TimeSlot {
  day: number; // 0-6 (Sunday to Saturday)
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code: string; // Course code like "CS101"
  instructor?: string;
  location?: string;
  color: string; // Hex color for UI
  credits?: number;
  type: 'lecture' | 'lab' | 'tutorial' | 'seminar' | 'other';
  timeSlots: TimeSlot[]; // Multiple time slots per week
  semester: string; // "2024-Spring", "2024-Fall"
  fromDate: string; // "YYYY-MM-DD" - start date for duplication
  toDate: string; // "YYYY-MM-DD" - end date for duplication
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ClassSession {
  id: string;
  subjectId: string;
  userId: string;
  date: string; // "YYYY-MM-DD"
  timeSlot: TimeSlot;
  attended?: boolean;
  notes?: string;
  createdAt: Timestamp;
}

export interface ScheduleTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string;
  subjects: Subject[];
  isDefault: boolean;
  createdAt: Timestamp;
}

// Subject Management
export const createSubject = async (userId: string, subjectData: Omit<Subject, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Filter out undefined values to avoid Firebase validation errors
    const cleanData = Object.fromEntries(
      Object.entries(subjectData).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = await addDoc(collection(db, 'subjects'), {
      ...cleanData,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating subject:', error);
    throw new Error('Failed to create subject');
  }
};

export const updateSubject = async (_userId: string, subjectId: string, updates: Partial<Subject>): Promise<void> => {
  try {
    // Filter out undefined values to avoid Firebase validation errors
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    const subjectRef = doc(db, 'subjects', subjectId);
    await updateDoc(subjectRef, {
      ...cleanUpdates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    throw new Error('Failed to update subject');
  }
};

export const deleteSubject = async (_userId: string, subjectId: string): Promise<void> => {
  try {
    const subjectRef = doc(db, 'subjects', subjectId);
    await deleteDoc(subjectRef);
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw new Error('Failed to delete subject');
  }
};

export const subscribeSubjects = (userId: string, callback: (subjects: Subject[]) => void): (() => void) => {
  const q = query(
    collection(db, 'subjects'),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const subjects: Subject[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as Omit<Subject, 'id'>;
      subjects.push({ ...data, id: doc.id });
    });
    // Sort by createdAt on the client side
    subjects.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    callback(subjects);
  });
};

// Schedule Template Management
export const createScheduleTemplate = async (userId: string, templateData: Omit<ScheduleTemplate, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'scheduleTemplates'), {
      ...templateData,
      userId,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating schedule template:', error);
    throw new Error('Failed to create schedule template');
  }
};

export const getScheduleTemplates = async (userId: string): Promise<ScheduleTemplate[]> => {
  try {
    const q = query(
      collection(db, 'scheduleTemplates'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScheduleTemplate));
  } catch (error) {
    console.error('Error getting schedule templates:', error);
    throw new Error('Failed to get schedule templates');
  }
};

// Class Session Management
export const createClassSession = async (userId: string, sessionData: Omit<ClassSession, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'classSessions'), {
      ...sessionData,
      userId,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating class session:', error);
    throw new Error('Failed to create class session');
  }
};

export const updateClassSession = async (sessionId: string, updates: Partial<ClassSession>): Promise<void> => {
  try {
    const sessionRef = doc(db, 'classSessions', sessionId);
    await updateDoc(sessionRef, updates);
  } catch (error) {
    console.error('Error updating class session:', error);
    throw new Error('Failed to update class session');
  }
};

// Utility Functions
export const getSubjectColors = (): string[] => [
  '#1890ff', '#52c41a', '#fa8c16', '#f5222d', '#722ed1',
  '#13c2c2', '#eb2f96', '#faad14', '#a0d911', '#2f54eb'
];

export const getDefaultTimeSlots = (): { label: string; start: string; end: string }[] => [
  { label: 'Morning 1', start: '08:00', end: '09:30' },
  { label: 'Morning 2', start: '09:45', end: '11:15' },
  { label: 'Morning 3', start: '11:30', end: '13:00' },
  { label: 'Afternoon 1', start: '13:30', end: '15:00' },
  { label: 'Afternoon 2', start: '15:15', end: '16:45' },
  { label: 'Evening 1', start: '17:00', end: '18:30' },
  { label: 'Evening 2', start: '18:45', end: '20:15' }
];

export const getDayName = (dayIndex: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
};

export const getDayShort = (dayIndex: number): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayIndex];
};

export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${startTime} - ${endTime}`;
};

// Conflict Detection
export const checkTimeConflict = (
  existingSlot: TimeSlot,
  newSlot: TimeSlot
): boolean => {
  if (existingSlot.day !== newSlot.day) return false;
  
  const existing = {
    start: timeToMinutes(existingSlot.startTime),
    end: timeToMinutes(existingSlot.endTime)
  };
  
  const newTime = {
    start: timeToMinutes(newSlot.startTime),
    end: timeToMinutes(newSlot.endTime)
  };
  
  return !(existing.end <= newTime.start || existing.start >= newTime.end);
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const findScheduleConflicts = (
  subjects: Subject[],
  todoTasks: any[]
): { type: 'subject' | 'todo'; conflict: any; conflictsWith: any }[] => {
  const conflicts: { type: 'subject' | 'todo'; conflict: any; conflictsWith: any }[] = [];
  
  // Check subject vs subject conflicts
  for (let i = 0; i < subjects.length; i++) {
    for (let j = i + 1; j < subjects.length; j++) {
      const subject1 = subjects[i];
      const subject2 = subjects[j];
      
      for (const slot1 of subject1.timeSlots) {
        for (const slot2 of subject2.timeSlots) {
          if (checkTimeConflict(slot1, slot2)) {
            conflicts.push({
              type: 'subject',
              conflict: subject1,
              conflictsWith: subject2
            });
          }
        }
      }
    }
  }
  
  // Check todo vs subject conflicts
  for (const todo of todoTasks) {
    // Use dueDate instead of date for tasks
    if (todo.dueDate && todo.startTime && todo.endTime) {
      const todoDate = new Date(todo.dueDate);
      const todoDay = todoDate.getDay();
      const todoSlot: TimeSlot = {
        day: todoDay,
        startTime: todo.startTime,
        endTime: todo.endTime
      };
      
      for (const subject of subjects) {
        for (const slot of subject.timeSlots) {
          if (checkTimeConflict(slot, todoSlot)) {
            conflicts.push({
              type: 'todo',
              conflict: todo,
              conflictsWith: subject
            });
          }
        }
      }
    }
  }
  
  return conflicts;
};

// Subject Duplication within Date Range
export const duplicateSubjectInDateRange = async (
  userId: string,
  subject: Subject
): Promise<void> => {
  try {
    const fromDate = new Date(subject.fromDate);
    const toDate = new Date(subject.toDate);
    
    // Generate all weeks between fromDate and toDate
    const weeks: Date[] = [];
    let currentWeek = getWeekStart(fromDate);
    const endWeek = getWeekStart(toDate);
    
    while (currentWeek <= endWeek) {
      weeks.push(new Date(currentWeek));
      currentWeek.setDate(currentWeek.getDate() + 7);
    }
    
    // Create class sessions for each week within the date range
    const promises = weeks.flatMap(weekStart =>
      subject.timeSlots.map(slot => {
        const sessionDate = getDateForDayInWeek(weekStart, slot.day);
        const sessionDateObj = new Date(sessionDate);
        
        // Only create session if it falls within the subject's date range
        if (sessionDateObj >= fromDate && sessionDateObj <= toDate) {
          return createClassSession(userId, {
            subjectId: subject.id,
            date: sessionDate,
            timeSlot: slot
          });
        }
        return Promise.resolve('');
      }).filter(promise => promise !== Promise.resolve(''))
    );
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Error duplicating subject in date range:', error);
    throw new Error('Failed to duplicate subject in date range');
  }
};

const getWeekStart = (date: Date): Date => {
  const weekStart = new Date(date);
  const dayOfWeek = weekStart.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as week start
  weekStart.setDate(weekStart.getDate() - daysToSubtract);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

const getDateForDayInWeek = (weekStart: Date, dayIndex: number): string => {
  const targetDate = new Date(weekStart);
  targetDate.setDate(weekStart.getDate() + dayIndex);
  return targetDate.toISOString().split('T')[0];
};
