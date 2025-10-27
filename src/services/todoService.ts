import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Todo {
  id: string;
  title: string; // Only required field
  priority?: number; // 1: Low, 2: Medium, 3: High - optional
  completed?: boolean; // optional
  description?: string;
  dueDate?: string;
  startTime?: string; // Optional start time (HH:mm format)
  endTime?: string; // Optional end time (HH:mm format)
  category?: string; // optional
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp | null;
}

export interface CreateTodoData {
  title: string; // Only required field
  priority?: number;
  description?: string;
  dueDate?: string;
  startTime?: string;
  endTime?: string;
  category?: string;
}

export interface UpdateTodoData {
  title?: string;
  priority?: number;
  completed?: boolean;
  description?: string;
  dueDate?: string;
  startTime?: string;
  endTime?: string;
  category?: string;
  completedAt?: Timestamp | null;
}

// Helper function to convert undefined values to null for Firebase
const sanitizeForFirebase = (obj: any): any => {
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = value === undefined ? null : value;
  }
  return sanitized;
};

// Get todos collection reference for a user
const getTodosCollection = (userId: string) => {
  return collection(db, 'users', userId, 'todos');
};

// Create new todo
export const createTodo = async (userId: string, todoData: CreateTodoData): Promise<string> => {
  try {
    const todosRef = getTodosCollection(userId);
    const now = Timestamp.now();
    
    // Validate time fields if provided
    if (todoData.startTime && todoData.endTime) {
      const start = new Date(`2000-01-01T${todoData.startTime}:00`);
      const end = new Date(`2000-01-01T${todoData.endTime}:00`);
      if (start >= end) {
        throw new Error('Start time must be before end time');
      }
    }
    
    const docRef = await addDoc(todosRef, sanitizeForFirebase({
      ...todoData,
      priority: todoData.priority ?? 2, // Default to medium priority
      completed: false,
      category: todoData.category || 'Others', // Default category
      createdAt: now,
      updatedAt: now
    }));

    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create todo');
  }
};

// Get all todos for a user
export const getTodos = async (userId: string): Promise<Todo[]> => {
  try {
    const todosRef = getTodosCollection(userId);
    const q = query(todosRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Todo));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get todos');
  }
};

// Update todo
export const updateTodo = async (
  userId: string, 
  todoId: string, 
  updateData: UpdateTodoData
): Promise<void> => {
  try {
    // Validate time fields if provided
    if (updateData.startTime && updateData.endTime) {
      const start = new Date(`2000-01-01T${updateData.startTime}:00`);
      const end = new Date(`2000-01-01T${updateData.endTime}:00`);
      if (start >= end) {
        throw new Error('Start time must be before end time');
      }
    }
    
    const todoRef = doc(db, 'users', userId, 'todos', todoId);
    await updateDoc(todoRef, sanitizeForFirebase({
      ...updateData,
      updatedAt: Timestamp.now()
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update todo');
  }
};

// Delete todo
export const deleteTodo = async (userId: string, todoId: string): Promise<void> => {
  try {
    const todoRef = doc(db, 'users', userId, 'todos', todoId);
    await deleteDoc(todoRef);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete todo');
  }
};

// Toggle todo completion
export const toggleTodoCompletion = async (
  userId: string, 
  todoId: string, 
  completed: boolean
): Promise<void> => {
  try {
    const updateData: UpdateTodoData = {
      completed,
      completedAt: completed ? Timestamp.now() : null
    };
    await updateTodo(userId, todoId, updateData);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to toggle todo completion');
  }
};

// Subscribe to todos changes (real-time)
export const subscribeTodos = (
  userId: string,
  callback: (todos: Todo[]) => void
): (() => void) => {
  const todosRef = getTodosCollection(userId);
  const q = query(todosRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (querySnapshot) => {
    const todos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Todo));
    callback(todos);
  });
};

export const getPriorityLabel = (priority: number): string => {
  switch (priority) {
    case 1: return 'low';
    case 2: return 'medium';
    case 3: return 'high';
    default: return 'medium';
  }
};

export const getPriorityNumber = (priority: string): number => {
  switch (priority.toLowerCase()) {
    case 'low': return 1;
    case 'medium': return 2;
    case 'high': return 3;
    default: return 2;
  }
};

// Default task categories (for reference only)
export const DEFAULT_CATEGORIES = [
  'Homework',
  'Housework', 
  'Sport',
  'Others'
] as const;

export type TaskCategory = string;

export const getCategoryIcon = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'homework': return '📚';
    case 'housework': return '🏠';
    case 'sport': return '⚽';
    case 'others': return '📝';
    case 'work': return '💼';
    case 'personal': return '👤';
    case 'health': return '🏥';
    case 'finance': return '💰';
    case 'education': return '🎓';
    case 'home': return '🏠';
    case 'shopping': return '🛒';
    case 'travel': return '✈️';
    case 'social': return '👥';
    default: return '📝';
  }
};

// Category management with Firebase

// Get categories collection reference for a user
const getCategoriesCollection = (userId: string) => {
  return collection(db, 'users', userId, 'categories');
};

// Get all categories for a user
export const getAllCategories = async (userId: string): Promise<string[]> => {
  try {
    const categoriesRef = getCategoriesCollection(userId);
    const q = query(categoriesRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const categories = querySnapshot.docs.map(doc => doc.data().name);
    
    // Remove duplicates just in case
    const uniqueCategories = [...new Set(categories)];
    
    return uniqueCategories;
  } catch (error: any) {
    console.error('Failed to get categories:', error);
    return [];
  }
};

// Add new category
export const addCategory = async (userId: string, category: string): Promise<boolean> => {
  if (!category.trim()) return false;
  
  const trimmedCategory = category.trim();
  const allCategories = await getAllCategories(userId);
  
  // Check if category already exists (case insensitive)
  if (allCategories.some(cat => cat.toLowerCase() === trimmedCategory.toLowerCase())) {
    return false;
  }
  
  try {
    const categoriesRef = getCategoriesCollection(userId);
    await addDoc(categoriesRef, {
      name: trimmedCategory,
      createdAt: Timestamp.now(),
      userId: userId
    });
    return true;
  } catch (error: any) {
    console.error('Failed to add category:', error);
    return false;
  }
};

// Update category name
export const updateCategory = async (userId: string, oldName: string, newName: string): Promise<boolean> => {
  if (!newName.trim()) return false;
  
  const trimmedNewName = newName.trim();
  
  // Check if new name already exists
  const allCategories = await getAllCategories(userId);
  const filteredCategories = allCategories.filter(cat => cat !== oldName);
  if (filteredCategories.some(cat => cat.toLowerCase() === trimmedNewName.toLowerCase())) {
    return false;
  }
  
  try {
    const categoriesRef = getCategoriesCollection(userId);
    const q = query(categoriesRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const categoryDoc = querySnapshot.docs.find(doc => doc.data().name === oldName);
    if (!categoryDoc) return false;
    
    await updateDoc(categoryDoc.ref, {
      name: trimmedNewName,
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error: any) {
    console.error('Failed to update category:', error);
    return false;
  }
};

// Delete category
export const deleteCategory = async (userId: string, category: string): Promise<boolean> => {
  try {
    const categoriesRef = getCategoriesCollection(userId);
    const q = query(categoriesRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const categoryDoc = querySnapshot.docs.find(doc => doc.data().name === category);
    if (!categoryDoc) {
      return false;
    }
    
    await deleteDoc(categoryDoc.ref);
    return true;
  } catch (error: any) {
    console.error('Failed to delete category:', error);
    return false;
  }
};

// Legacy function - kept for backward compatibility but not used
export const isDefaultCategory = (): boolean => {
  return false;
};

// Conflict Detection Functions
export interface TaskConflict {
  type: 'task' | 'subject';
  conflict: Todo | any;
  conflictsWith: Todo | any;
  message: string;
}

// Check if two time ranges overlap
const checkTimeOverlap = (
  start1: string, 
  end1: string, 
  start2: string, 
  end2: string
): boolean => {
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const start1Minutes = timeToMinutes(start1);
  const end1Minutes = timeToMinutes(end1);
  const start2Minutes = timeToMinutes(start2);
  const end2Minutes = timeToMinutes(end2);

  return !(end1Minutes <= start2Minutes || start1Minutes >= end2Minutes);
};

// Check if two tasks conflict (same date and overlapping time)
const checkTaskConflict = (task1: Todo, task2: Todo): boolean => {
  // Both tasks need date and time to have a conflict
  if (!task1.dueDate || !task1.startTime || !task1.endTime ||
      !task2.dueDate || !task2.startTime || !task2.endTime) {
    return false;
  }

  // Must be on the same date
  if (task1.dueDate !== task2.dueDate) {
    return false;
  }

  // Check time overlap
  return checkTimeOverlap(task1.startTime, task1.endTime, task2.startTime, task2.endTime);
};

// Check if a task conflicts with a timetable subject
const checkTaskSubjectConflict = (task: Todo, subject: any): boolean => {
  if (!task.dueDate || !task.startTime || !task.endTime) {
    return false;
  }

  const taskDate = new Date(task.dueDate);
  const taskDay = taskDate.getDay();

  // Check against all time slots of the subject
  for (const slot of subject.timeSlots || []) {
    if (slot.day === taskDay) {
      if (checkTimeOverlap(task.startTime, task.endTime, slot.startTime, slot.endTime)) {
        return true;
      }
    }
  }

  return false;
};

// Find all conflicts for tasks
export const findTaskConflicts = (
  tasks: Todo[],
  subjects: any[] = [],
  excludeTaskId?: string
): TaskConflict[] => {
  const conflicts: TaskConflict[] = [];

  // Filter out the task being edited if provided
  const filteredTasks = excludeTaskId 
    ? tasks.filter(task => task.id !== excludeTaskId)
    : tasks;

  // Check task vs task conflicts
  for (let i = 0; i < filteredTasks.length; i++) {
    for (let j = i + 1; j < filteredTasks.length; j++) {
      const task1 = filteredTasks[i];
      const task2 = filteredTasks[j];

      if (checkTaskConflict(task1, task2)) {
        conflicts.push({
          type: 'task',
          conflict: task1,
          conflictsWith: task2,
          message: `Task "${task1.title}" conflicts with task "${task2.title}" on ${task1.dueDate} (${task1.startTime}-${task1.endTime})`
        });
      }
    }
  }

  // Check task vs subject conflicts
  for (const task of filteredTasks) {
    for (const subject of subjects) {
      if (checkTaskSubjectConflict(task, subject)) {
        const taskDate = new Date(task.dueDate!);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[taskDate.getDay()];
        
        conflicts.push({
          type: 'subject',
          conflict: task,
          conflictsWith: subject,
          message: `Task "${task.title}" conflicts with subject "${subject.name}" on ${dayName} (${task.startTime}-${task.endTime})`
        });
      }
    }
  }

  return conflicts;
};

// Check conflicts for a specific task being created/edited
export const checkTaskForConflicts = (
  taskData: CreateTodoData | UpdateTodoData,
  existingTasks: Todo[],
  subjects: any[] = [],
  excludeTaskId?: string
): TaskConflict[] => {
  // Create a temporary task object for conflict checking
  const tempTask: Todo = {
    id: excludeTaskId || 'temp',
    title: taskData.title || 'Temporary Task',
    dueDate: taskData.dueDate,
    startTime: taskData.startTime,
    endTime: taskData.endTime,
    priority: taskData.priority,
    description: taskData.description,
    category: taskData.category,
    createdAt: new Date() as any,
    updatedAt: new Date() as any
  };

  // If the task doesn't have time information, no conflicts possible
  if (!tempTask.dueDate || !tempTask.startTime || !tempTask.endTime) {
    return [];
  }

  const conflicts: TaskConflict[] = [];

  // Filter out the task being edited if provided
  const filteredTasks = excludeTaskId 
    ? existingTasks.filter(task => task.id !== excludeTaskId)
    : existingTasks;

  // Check against existing tasks
  for (const existingTask of filteredTasks) {
    if (checkTaskConflict(tempTask, existingTask)) {
      conflicts.push({
        type: 'task',
        conflict: tempTask,
        conflictsWith: existingTask,
        message: `This task conflicts with "${existingTask.title}" on ${tempTask.dueDate} (${tempTask.startTime}-${tempTask.endTime})`
      });
    }
  }

  // Check against subjects
  for (const subject of subjects) {
    if (checkTaskSubjectConflict(tempTask, subject)) {
      const taskDate = new Date(tempTask.dueDate);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[taskDate.getDay()];
      
      conflicts.push({
        type: 'subject',
        conflict: tempTask,
        conflictsWith: subject,
        message: `This task conflicts with subject "${subject.name}" on ${dayName} (${tempTask.startTime}-${tempTask.endTime})`
      });
    }
  }

  return conflicts;
};
