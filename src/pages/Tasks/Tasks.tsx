import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Button, 
  List, 
  Checkbox, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker,
  TimePicker,
  message,
  Space,
  Dropdown,
  Spin,
  Empty,
  Pagination,
  Drawer,
  Alert,
  Radio
} from 'antd';
import type { MenuProps } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  MoreOutlined,
  CalendarOutlined,
  FlagOutlined,
  LoginOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  SearchOutlined
} from '@ant-design/icons';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotifications } from '../../contexts/NotificationContext';
import type { Todo } from '../../services/todoService';
import { 
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoCompletion,
  subscribeTodos,
  getPriorityLabel,
  getPriorityNumber,
  getAllCategories,
  getCategoryIcon,
  addCategory,
  updateCategory,
  deleteCategory,
  checkTaskForConflicts,
  findTaskConflicts,
  type TaskConflict
} from '../../services/todoService';
import { Link } from 'react-router-dom';
import CalendarView from '../../components/Calendar/CalendarView';
import FocusMode from '../../components/FocusMode/FocusMode';
import type { ChatTurn } from '../../services/aiService';
import { parseNLToTasks, LOW_CONFIDENCE_THRESHOLD } from '../../services/aiService';
import { subscribeSubjects } from '../../services/timetableService';

const { TextArea } = Input;
const { Option } = Select;

const Tasks: FC = () => {
  const { user, isLoggedIn } = useAuth();
  const { withLoading } = useLoading();
  const { addNotification } = useNotifications();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categories, setCategories] = useState<string[]>([]);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    visible: boolean;
    type: 'todo' | 'category';
    id: string;
    name?: string;
  }>({
    visible: false,
    type: 'todo',
    id: '',
    name: ''
  });
  const [isFocusModeVisible, setIsFocusModeVisible] = useState(false);

  // AI Drawer state
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiInput, setAiInput] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiHistory, setAiHistory] = useState<ChatTurn[]>([]);
  const chatRef = useRef<HTMLDivElement | null>(null);
  
  interface UICandidate {
    id: string;
    title: string;
    priority?: 'low' | 'medium' | 'high';
    description?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    category?: string;
    confidence: number;
    selected: boolean;
  };
  const [aiCandidates, setAiCandidates] = useState<UICandidate[]>([]);

  // New state for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [priorityFilter, setPriorityFilter] = useState<number | null>(null);
  const [timeRangeFilter, setTimeRangeFilter] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [sortBy, setSortBy] = useState('creationDate'); // 'creationDate', 'dueDate', 'priority'

  // Conflict detection state
  const [subjects, setSubjects] = useState<any[]>([]);
  const [currentTaskConflicts, setCurrentTaskConflicts] = useState<TaskConflict[]>([]);

  // Subscribe to todos and subjects changes
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const unsubscribeTodos = subscribeTodos(user.uid, (todos) => {
      setTodos(todos);
      setLoading(false);
    });

    const unsubscribeSubjects = subscribeSubjects(user.uid, (subjects) => {
      setSubjects(subjects);
    });

    return () => {
      unsubscribeTodos();
      unsubscribeSubjects();
    };
  }, [user?.uid]);

  // Check for conflicts when todos or subjects change (for display purposes)
  const allTaskConflicts = findTaskConflicts(todos, subjects);

  // Reset to first page when todos change significantly  
  useEffect(() => {
    const pendingCount = todos.filter(todo => !todo.completed).length;
    const completedCount = todos.filter(todo => todo.completed).length;
    const totalTodos = pendingCount + completedCount;
    const maxPage = Math.ceil(totalTodos / pageSize);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(Math.max(1, maxPage));
    }
  }, [todos.length, pageSize, currentPage]);

  // Load categories when user changes
  useEffect(() => {
    const loadCategories = async () => {
      if (!user?.uid) {
        setCategories([]);
        return;
      }
      
      setCategoriesLoading(true);
      try {
        // Load all categories (defaults are automatically created during registration)
        const allCategories = await getAllCategories(user.uid);
        setCategories(allCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    loadCategories();
  }, [user?.uid]);

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return 'red';    // high
      case 2: return 'orange'; // medium
      case 1: return 'green';  // low
      default: return 'default';
    }
  };

  const handleTodoToggle = async (todoId: string, e: CheckboxChangeEvent) => {
    if (!user?.uid) return;
    
    try {
      await withLoading(async () => {
        await toggleTodoCompletion(user.uid, todoId, e.target.checked);
      });
      messageApi.success(e.target.checked ? 'Task completed! 🎉' : 'Task marked as pending');
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to update task');
    }
  };

  const handleAddTodo = () => {
    setEditingTodo(null);
    form.resetFields();
    setCurrentTaskConflicts([]);
    // Don't set any default values - let user choose
    setIsModalVisible(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    form.setFieldsValue({
      title: todo.title,
      description: todo.description,
      priority: todo.priority ? getPriorityLabel(todo.priority) : undefined,
      category: todo.category || undefined,
      dueDate: todo.dueDate ? dayjs(todo.dueDate) : null,
      startTime: todo.startTime ? dayjs(todo.startTime, 'HH:mm') : undefined,
      endTime: todo.endTime ? dayjs(todo.endTime, 'HH:mm') : undefined,
    });
    setCurrentTaskConflicts([]);
    setIsModalVisible(true);
  };

  // Check conflicts in real-time as user types
  const checkCurrentTaskConflicts = () => {
    try {
      const values = form.getFieldsValue();
      if (values.dueDate && values.startTime && values.endTime) {
        const taskData = {
          title: values.title || 'New Task',
          dueDate: dayjs(values.dueDate).format('YYYY-MM-DD'),
          startTime: dayjs(values.startTime).format('HH:mm'),
          endTime: dayjs(values.endTime).format('HH:mm'),
          description: values.description,
          priority: values.priority ? getPriorityNumber(values.priority) : undefined,
          category: values.category,
        };

        const conflicts = checkTaskForConflicts(
          taskData,
          todos,
          subjects,
          editingTodo?.id
        );
        setCurrentTaskConflicts(conflicts);
      } else {
        setCurrentTaskConflicts([]);
      }
    } catch (error) {
      // Ignore validation errors during typing
      setCurrentTaskConflicts([]);
    }
  };

  const handleDeleteTodo = (todoId: string) => {
    if (!user?.uid) return;

    setDeleteConfirmModal({
      visible: true,
      type: 'todo',
      id: todoId,
      name: ''
    });
  };

  const handleModalOk = async () => {
    if (!user?.uid) return;

    try {
      const values = await form.validateFields();
      const todoData = {
        title: values.title,
        description: values.description || undefined,
        priority: values.priority ? getPriorityNumber(values.priority) : undefined,
        category: values.category || undefined,
        dueDate: values.dueDate ? dayjs(values.dueDate).format('YYYY-MM-DD') : undefined,
        startTime: values.startTime ? dayjs(values.startTime).format('HH:mm') : undefined,
        endTime: values.endTime ? dayjs(values.endTime).format('HH:mm') : undefined,
      };

      // Remove undefined values to prevent Firebase issues
      Object.keys(todoData).forEach(key => {
        if (todoData[key as keyof typeof todoData] === undefined) {
          delete todoData[key as keyof typeof todoData];
        }
      });

      // Check for conflicts before saving
      const conflicts = checkTaskForConflicts(
        todoData,
        todos,
        subjects,
        editingTodo?.id
      );

      if (conflicts.length > 0) {
        conflicts.forEach(conflict => {
          addNotification(conflict.message, 'warning');
        });
      }

      await withLoading(async () => {
        if (editingTodo) {
          // Update existing todo
          await updateTodo(user.uid, editingTodo.id, todoData);
        } else {
          // Add new todo
          await createTodo(user.uid, todoData);
        }
      });
      
      messageApi.success(editingTodo ? 'Task updated successfully' : 'Task added successfully');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error
        return;
      }
      messageApi.error(error.message || 'Failed to save task');
    }
  };

  const getTodoActions = (todo: Todo): MenuProps['items'] => [
    {
      key: 'edit',
      label: (
        <span style={{ color: 'var(--color-text)' }}>
          <EditOutlined style={{ marginRight: '8px' }} />
          Edit Task
        </span>
      ),
      onClick: () => handleEditTodo(todo),
    },
    {
      key: 'delete',
      label: (
        <span style={{ color: '#ff4d4f' }}>
          <DeleteOutlined style={{ marginRight: '8px' }} />
          Delete Task
        </span>
      ),
      onClick: () => handleDeleteTodo(todo.id),
    },
  ];

  const pendingTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);
  
  // All todos for list view with pagination
  const allTodos = [...pendingTodos, ...completedTodos];
  
  // Filtering and Sorting Logic
  const filteredAndSortedTodos = allTodos
    .filter(todo => {
      // Search term filter
      if (searchTerm && !todo.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Status filter
      if (statusFilter === 'pending' && todo.completed) {
        return false;
      }
      if (statusFilter === 'completed' && !todo.completed) {
        return false;
      }
      // Priority filter
      if (priorityFilter !== null && todo.priority !== priorityFilter) {
        return false;
      }
      // Time range filter
      const [startTime, endTime] = timeRangeFilter;
      if (startTime && endTime && todo.startTime) {
        const taskTime = dayjs(todo.startTime, 'HH:mm');
        if (!taskTime.isBetween(startTime, endTime, null, '[]')) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return dayjs(a.dueDate).isAfter(dayjs(b.dueDate)) ? 1 : -1;
        case 'priority':
          return (b.priority || 0) - (a.priority || 0);
        case 'creationDate':
        default:
          return b.createdAt.toMillis() - a.createdAt.toMillis();
      }
    });


  // Calculate paginated data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTodos = filteredAndSortedTodos.slice(startIndex, endIndex);
  
  // Pagination handlers
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when page size changes
    }
  };

  // Category management functions
  const refreshCategories = async () => {
    if (!user?.uid) return;
    
    setCategoriesLoading(true);
    try {
      const allCategories = await getAllCategories(user.uid);
      setCategories(allCategories);
    } catch (error) {
      console.error('Failed to refresh categories:', error);
      messageApi.error('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!user?.uid) {
      messageApi.error('Please log in to add categories');
      return;
    }

    try {
      const values = await categoryForm.validateFields();
      
      const success = await withLoading(async () => {
        return await addCategory(user.uid, values.categoryName);
      });
      
      if (success) {
        messageApi.success('Category added successfully!');
        await refreshCategories();
        setIsCategoryModalVisible(false);
        categoryForm.resetFields();
      } else {
        messageApi.error('Category already exists!');
      }
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation failed
        return;
      }
      messageApi.error('Failed to add category');
    }
  };

  const handleEditCategory = (categoryName: string) => {
    setEditingCategory(categoryName);
    categoryForm.setFieldsValue({ categoryName });
    setIsCategoryModalVisible(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !user?.uid) return;
    
    try {
      const values = await categoryForm.validateFields();
      
      const success = await withLoading(async () => {
        return await updateCategory(user.uid, editingCategory, values.categoryName);
      });
      
      if (success) {
        messageApi.success('Category updated successfully!');
        await refreshCategories();
        setIsCategoryModalVisible(false);
        setEditingCategory(null);
        categoryForm.resetFields();
      } else {
        messageApi.error('Category name already exists!');
      }
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation failed
        return;
      }
      messageApi.error('Failed to update category');
    }
  };

  const handleDeleteCategory = (categoryName: string) => {
    if (!user?.uid) {
      messageApi.error('Please log in to delete categories');
      return;
    }

    setDeleteConfirmModal({
      visible: true,
      type: 'category',
      id: categoryName,
      name: categoryName
    });
  };

  const handleConfirmDelete = async () => {
    if (!user?.uid) return;

    try {
      await withLoading(async () => {
        if (deleteConfirmModal.type === 'todo') {
          await deleteTodo(user.uid, deleteConfirmModal.id);
        } else if (deleteConfirmModal.type === 'category') {
          const success = await deleteCategory(user.uid, deleteConfirmModal.id);
          if (!success) {
            throw new Error('Failed to delete category');
          }
          await refreshCategories();
        }
      });
      
      messageApi.success(
        deleteConfirmModal.type === 'todo' 
          ? 'Task deleted successfully' 
          : 'Category deleted successfully!'
      );
      
      // Close modal
      setDeleteConfirmModal({
        visible: false,
        type: 'todo',
        id: '',
        name: ''
      });
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to delete');
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmModal({
      visible: false,
      type: 'todo',
      id: '',
      name: ''
    });
  };

  const openCategoryModal = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    setIsCategoryModalVisible(true);
  };

  // AI actions
  const openAiDrawer = () => setAiDrawerOpen(true);
  const closeAiDrawer = () => setAiDrawerOpen(false);

  const applyConfidence = (items: Array<{ title: string; priority?: 'low' | 'medium' | 'high'; description?: string; date?: string; startTime?: string; endTime?: string; category?: string; confidence?: number; }>): UICandidate[] => {
    return items.map((t, idx) => {
      const conf = typeof t.confidence === 'number' ? t.confidence : 0.7;
      return {
        id: `${Date.now()}-${idx}`,
        title: t.title,
        priority: t.priority,
        description: t.description,
        date: t.date,
        startTime: t.startTime,
        endTime: t.endTime,
        category: t.category,
        confidence: conf,
        selected: conf >= LOW_CONFIDENCE_THRESHOLD,
      };
    });
  };

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    const newHistory: ChatTurn[] = [...aiHistory, { role: 'user', content: aiInput.trim() }];
    setAiHistory(newHistory);
    try {
      const res = await parseNLToTasks({
        text: aiInput.trim(),
        history: newHistory,
        options: { 
          locale: 'en-US',
          availableCategories: categories
        },
      });
      const candidates = applyConfidence(res.tasks ?? []);
      setAiCandidates(candidates);
      const summary = candidates.length > 0
        ? `Proposed ${candidates.length} task(s).`
        : 'I could not extract a task from your message. Could you please be more specific about what task you\'d like to create?';
      setAiHistory(h => [...h, { role: 'assistant', content: summary }]);
      setAiInput('');
    } catch (e: any) {
      messageApi.error(e.message || 'AI parsing failed');
      setAiHistory(h => [...h, { role: 'assistant', content: 'Parsing failed. Please try rephrasing.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  const toggleCandidate = (id: string) => {
    setAiCandidates(cs => cs.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  };

  const selectAllCandidates = () => {
    setAiCandidates(cs => cs.map(c => ({ ...c, selected: true })));
  };

  const deselectAllCandidates = () => {
    setAiCandidates(cs => cs.map(c => ({ ...c, selected: false })));
  };

  const addSelectedCandidates = async () => {
    if (!user?.uid) return;
    const selected = aiCandidates.filter(c => c.selected);
    if (selected.length === 0) {
      messageApi.info('Please select at least one task');
      return;
    }
    try {
      await withLoading(async () => {
        for (const c of selected) {
          await createTodo(user.uid, {
            title: c.title,
            priority: c.priority ? getPriorityNumber(c.priority) : undefined,
            description: c.description || undefined,
            dueDate: c.date || undefined,
            startTime: c.startTime || undefined,
            endTime: c.endTime || undefined,
            category: c.category || undefined,
          });
        }
      });
      messageApi.success(`Added ${selected.length} task(s)`);
      setAiCandidates([]);
    } catch (e: any) {
      messageApi.error(e.message || 'Failed to add tasks');
    }
  };

  // Auto-scroll chat to bottom on updates
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [aiHistory, aiCandidates, aiLoading]);

  // Enter to send (Shift+Enter for newline)
  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!aiLoading) handleAiSend();
    }
  };

  // Show login prompt if not authenticated
  if (!isLoggedIn) {
    return (
      <div style={{ padding: '40px 0' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <Card>
            <LoginOutlined style={{ fontSize: '4rem', color: 'var(--color-text)', marginBottom: '24px' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px', color: 'var(--color-text)' }}>
              Login Required
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-muted)', marginBottom: '32px' }}>
              Please log in to manage your tasks and stay organized.
            </p>
            <Space size="large">
              <Link to="/login">
                <Button type="primary" size="large" style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--accent-contrast)' }}>
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="large" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                  Sign Up
                </Button>
              </Link>
            </Space>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div style={{ padding: '40px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '16px', color: 'var(--color-text)' }}>
              📅 Task Manager
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-muted)' }}>
              {loading ? 'Loading...' : `${pendingTodos.length} pending • ${completedTodos.length} completed • Total: ${allTodos.length} tasks`}
            </p>
          </div>
          <Space>
            <Button
              type={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? 'var(--accent)' : 'var(--color-surface)',
                borderColor: 'var(--accent)',
                color: viewMode === 'list' ? 'var(--accent-contrast)' : 'var(--color-text)'
              }}
            >
              📋 List View
            </Button>
            <Button
              type={viewMode === 'calendar' ? 'primary' : 'default'}
              onClick={() => setViewMode('calendar')}
              style={{
                background: viewMode === 'calendar' ? 'var(--accent)' : 'var(--color-surface)',
                borderColor: 'var(--accent)',
                color: viewMode === 'calendar' ? 'var(--accent-contrast)' : 'var(--color-text)'
              }}
            >
              📅 Calendar View
            </Button>
            <Button 
              type="primary" 
              size="large"
              icon={<PlusOutlined />}
              onClick={handleAddTodo}
              disabled={loading}
              style={{ 
                background: 'var(--accent)', 
                borderColor: 'var(--accent)',
                color: 'var(--accent-contrast)',
                padding: '8px 24px',
                height: 'auto'
              }}
            >
              Add Task
            </Button>
          </Space>
        </div>

        {/* Filter and Sort Controls */}
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <Input
              placeholder="Search tasks..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: '1 1 300px' }}
            />
            <Radio.Group value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <Radio.Button value="all">All</Radio.Button>
              <Radio.Button value="pending">Pending</Radio.Button>
              <Radio.Button value="completed">Completed</Radio.Button>
            </Radio.Group>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-muted)' }}>Priority</label>
              <Select
                placeholder="All Priorities"
                value={priorityFilter}
                onChange={(value) => setPriorityFilter(value)}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value={3}>High</Option>
                <Option value={2}>Medium</Option>
                <Option value={1}>Low</Option>
              </Select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-muted)' }}>Start Time Range</label>
              <TimePicker.RangePicker
                value={timeRangeFilter}
                onChange={(dates) => setTimeRangeFilter(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-muted)' }}>Sort By</label>
              <Select
                value={sortBy}
                onChange={(value) => setSortBy(value)}
                style={{ width: '100%' }}
              >
                <Option value="creationDate">Creation Date</Option>
                <Option value="dueDate">Due Date</Option>
              </Select>
            </div>
          </div>
        </Card>


        {/* Tasks Content */}
        {loading ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <p style={{ marginTop: '16px', color: 'var(--color-muted)' }}>Loading your tasks...</p>
            </div>
          </Card>
        ) : viewMode === 'calendar' ? (
          <CalendarView
            todos={todos}
            onEditTodo={handleEditTodo}
            onDeleteTodo={(todoId: string) => handleDeleteTodo(todoId)}
            onToggleTodo={async (todoId: string, completed: boolean) => {
              if (!user?.uid) return;
              try {
                await toggleTodoCompletion(user.uid, todoId, completed);
                messageApi.success(completed ? 'Task completed! 🎉' : 'Task marked as pending');
              } catch (error: any) {
                messageApi.error(error.message || 'Failed to update task');
              }
            }}
          />
        ) : (
          <Card>
            <List
              dataSource={paginatedTodos}
              renderItem={(todo) => (
                <List.Item
                  actions={[
                    <Dropdown 
                      menu={{ items: getTodoActions(todo) }} 
                      trigger={['click']}
                      placement="bottomRight"
                      overlayClassName="task-actions-dropdown"
                      arrow={false}
                      destroyPopupOnHide={false}
                      key="more"
                    >
                      <Button 
                        type="text" 
                        icon={<MoreOutlined />}
                        style={{ 
                          color: 'var(--color-muted)',
                          border: 'none',
                          background: 'transparent'
                        }}
                      />
                    </Dropdown>
                  ]}
                  style={{ padding: '16px 0' }}
                >
                  <List.Item.Meta
                    avatar={
                      <Checkbox
                        checked={todo.completed}
                        onChange={(e) => handleTodoToggle(todo.id, e)}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ 
                          color: 'var(--color-text)', 
                          fontSize: '1.1rem',
                          textDecoration: todo.completed ? 'line-through' : 'none'
                        }}>
                          {todo.title}
                        </span>
                        {todo.category && (
                          <Tag color="purple">
                            {getCategoryIcon(todo.category)} {todo.category}
                          </Tag>
                        )}
                        {todo.priority && (
                          <Tag color={getPriorityColor(todo.priority)}>
                            <FlagOutlined /> {getPriorityLabel(todo.priority)}
                          </Tag>
                        )}
                        {todo.dueDate && (
                          <Tag color="blue">
                            <CalendarOutlined /> {todo.dueDate}
                          </Tag>
                        )}
                        {(todo.startTime || todo.endTime) && (
                          <Tag color="cyan">
                            🕐 {todo.startTime || '??:??'} - {todo.endTime || '??:??'}
                          </Tag>
                        )}
                        {todo.completedAt && todo.completedAt.toDate && (
                          <Tag color="green">
                            ✅ Completed {dayjs(todo.completedAt.toDate()).format('MMM DD, HH:mm')}
                          </Tag>
                        )}
                      </div>
                    }
                    description={
                      todo.description && (
                        <span style={{ color: 'var(--color-muted)' }}>{todo.description}</span>
                      )
                    }
                  />
                </List.Item>
              )}
              locale={{ 
                emptyText: (
                  <Empty
                    description={
                      <span style={{ color: 'var(--color-muted)' }}>
                        No tasks yet. Create your first task to get started! 📝
                      </span>
                    }
                  />
                )
              }}
            />
            
            {/* Pagination */}
            {filteredAndSortedTodos.length > 0 && (
              <div style={{ 
                marginTop: '24px', 
                textAlign: 'center',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '20px'
              }}>
                <Pagination
                  current={currentPage}
                  total={filteredAndSortedTodos.length}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  onShowSizeChange={handlePageChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => 
                    `${range[0]}-${range[1]} of ${total} tasks`
                  }
                  pageSizeOptions={['5', '10', '20', '50']}
                  size="default"
                />
              </div>
            )}
          </Card>
        )}

        {/* Add/Edit Task Modal */}
        <Modal
          title={editingTodo ? 'Edit Task' : 'Add New Task'}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          okText={editingTodo ? 'Update' : 'Add'}
          okButtonProps={{ 
            style: { background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--accent-contrast)' }
          }}
        >
          {/* Conflict Warnings */}
          {currentTaskConflicts.length > 0 && (
            <Alert
              message="Schedule Conflicts Detected"
              description={
                <ul style={{ marginTop: '8px', paddingLeft: '20px', marginBottom: '0' }}>
                  {currentTaskConflicts.map((conflict, index) => (
                    <li key={index} style={{ marginBottom: '4px' }}>
                      {conflict.message}
                    </li>
                  ))}
                </ul>
              }
              type="warning"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            name="taskForm"
            onValuesChange={checkCurrentTaskConflicts}
          >
            <Form.Item
              label="Title"
              name="title"
              rules={[
                { required: true, message: 'Please input the task title!' },
                { max: 20, message: 'Title cannot exceed 20 characters!' }
              ]}
            >
              <Input 
                placeholder="Enter task title" 
                maxLength={20}
                showCount
              />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                { max: 50, message: 'Description cannot exceed 50 characters!' }
              ]}
            >
              <TextArea 
                rows={3} 
                placeholder="Enter task description"
                maxLength={50}
                showCount
              />
            </Form.Item>

            <Form.Item
              label={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{ color: 'var(--color-text)' }}>Category</span>
                  <Button 
                    size="small" 
                    onClick={openCategoryModal}
                    style={{ 
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--color-muted)',
                      background: 'var(--color-surface)',
                      fontSize: '12px',
                      height: '24px',
                      padding: '0 8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.color = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.color = 'var(--color-muted)';
                    }}
                  >
                    ⚙️ Manage
                  </Button>
                </div>
              }
              labelCol={{ flex: 1 }}
              wrapperCol={{ flex: 1 }}
              name="category"
            >
              <Select 
                placeholder="Select category"
                loading={categoriesLoading}
                style={{ width: '100%' }}
                dropdownStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                {categories.map((category) => (
                  <Option key={category} value={category}>
                    <span>{getCategoryIcon(category)} {category}</span>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Space style={{ width: '100%' }} direction="vertical">
              <Form.Item
                label="Priority"
                name="priority"
              >
                <Select 
                  placeholder="Select priority"
                  style={{ width: '100%' }}
                  dropdownStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  <Option value="high">
                    <span style={{ color: '#ff4d4f' }}>🔴 High Priority</span>
                  </Option>
                  <Option value="medium">
                    <span style={{ color: '#fa8c16' }}>🟡 Medium Priority</span>
                  </Option>
                  <Option value="low">
                    <span style={{ color: '#52c41a' }}>🟢 Low Priority</span>
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Due Date"
                name="dueDate"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.resolve(); 
                      }
                      const selectedDate = dayjs(value).startOf('day');
                      const today = dayjs().startOf('day');
                      
                      if (selectedDate.isBefore(today)) {
                        return Promise.reject(new Error('Due date cannot be in the past!'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  placeholder="Select due date"
                  format="YYYY-MM-DD"
                  disabledDate={(current) => {
                    return current && current.isBefore(dayjs().startOf('day'));
                  }}
                  popupStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                />
              </Form.Item>


              <Form.Item
                label="Start Time "
                name="startTime"
                rules={[
                  {
                    validator: (_, value) => {
                      const endTime = form.getFieldValue('endTime');
                      if (value && endTime) {
                        const start = dayjs(value);
                        const end = dayjs(endTime);
                        if (start.isAfter(end) || start.isSame(end)) {
                          return Promise.reject(new Error('Start time must be before end time!'));
                        }
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <TimePicker 
                  style={{ width: '100%' }}
                  placeholder="Select start time"
                  format="HH:mm"
                  popupStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  onChange={() => {
                    form.validateFields(['endTime']);
                  }}
                />
              </Form.Item>

              <Form.Item
                label="End Time "
                name="endTime"
                rules={[
                  {
                    validator: (_, value) => {
                      const startTime = form.getFieldValue('startTime');
                      if (value && startTime) {
                        const start = dayjs(startTime);
                        const end = dayjs(value);
                        if (end.isBefore(start) || end.isSame(start)) {
                          return Promise.reject(new Error('End time must be after start time!'));
                        }
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <TimePicker 
                  style={{ width: '100%' }}
                  placeholder="Select end time"
                  format="HH:mm"
                  popupStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  onChange={() => {
                    // Re-validate start time when end time changes
                    form.validateFields(['startTime']);
                  }}
                />
              </Form.Item>
            </Space>
          </Form>
        </Modal>

        {/* Category Management Modal */}
        <Modal
          title={editingCategory ? 'Edit Category' : 'Manage Categories'}
          open={isCategoryModalVisible}
          onOk={editingCategory ? handleUpdateCategory : handleAddCategory}
          onCancel={() => {
            setIsCategoryModalVisible(false);
            setEditingCategory(null);
            categoryForm.resetFields();
          }}
          okText={editingCategory ? 'Update' : 'Add Category'}
          okButtonProps={{ 
            style: { background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--accent-contrast)' }
          }}
          confirmLoading={categoriesLoading}
          width={600}
        >
          <div>
            {/* Add/Edit Category Form */}
            <Form
              form={categoryForm}
              layout="vertical"
              style={{ marginBottom: '24px' }}
            >
              <Form.Item
                label={editingCategory ? 'Edit Category Name' : 'New Category Name'}
                name="categoryName"
                rules={[
                  { required: true, message: 'Please enter category name!' },
                  { min: 2, message: 'Category name must be at least 2 characters!' },
                  { max: 20, message: 'Category name cannot exceed 20 characters!' }
                ]}
              >
                <Input 
                  placeholder="Enter category name"
                  maxLength={20}
                  showCount
                />
              </Form.Item>
            </Form>

            {/* Current Categories List */}
            {!editingCategory && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, color: 'var(--color-text)' }}>Current Categories:</h4>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {categoriesLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <Spin size="large" />
                      <p style={{ marginTop: '16px', color: 'var(--color-muted)' }}>Loading categories...</p>
                    </div>
                  ) : (
                    categories.map((category) => (
                    <div 
                      key={category}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        margin: '8px 0',
                        background: 'var(--color-surface)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{getCategoryIcon(category)}</span>
                        <span style={{ fontWeight: '500', color: 'var(--color-text)' }}>{category}</span>
                      </div>
                      
                      <Space>
                        <Button 
                          size="small" 
                          type="text"
                          onClick={() => handleEditCategory(category)}
                          style={{ color: 'var(--color-muted)' }}
                        >
                          ✏️
                        </Button>
                        <Button 
                          size="small" 
                          type="text"
                          danger
                          onClick={() => handleDeleteCategory(category)}
                          style={{ color: '#ff4d4f' }}
                        >
                          🗑️
                        </Button>
                      </Space>
                    </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          title={deleteConfirmModal.type === 'todo' ? 'Delete Task' : 'Delete Category'}
          open={deleteConfirmModal.visible}
          onOk={handleConfirmDelete}
          onCancel={handleCancelDelete}
          okText="Yes, Delete"
          cancelText="Cancel"
          okButtonProps={{
            danger: true,
            style: { background: '#ff4d4f', borderColor: '#ff4d4f' }
          }}
        >
          <p>
            {deleteConfirmModal.type === 'todo' 
              ? 'Are you sure you want to delete this task?'
              : `Are you sure you want to delete "${deleteConfirmModal.name}"? This action cannot be undone.`
            }
          </p>
        </Modal>

        {/* Focus Mode Modal */}
        <FocusMode 
          visible={isFocusModeVisible}
          onClose={() => setIsFocusModeVisible(false)}
        />

        {/* AI Assistant Drawer */}
        <Drawer
          title="🤖 AI Task Assistant"
          placement="right"
          onClose={closeAiDrawer}
          open={aiDrawerOpen}
          width={500}
          styles={{
            body: { padding: 0 },
            header: { 
              background: 'var(--color-surface)',
              borderBottom: '1px solid var(--border-color)',
              color: 'var(--color-text)'
            }
          }}
        >
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Chat History */}
            <div 
              ref={chatRef}
              style={{ 
                flex: 1, 
                padding: '16px', 
                overflowY: 'auto',
                background: 'var(--color-background)'
              }}
            >
              {aiHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-muted)' }}>
                  <RobotOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <h3 style={{ color: 'var(--color-text)', marginBottom: '8px' }}>AI Task Assistant</h3>
                  <p>Tell me what tasks you'd like to create and I'll help you organize them!</p>
                  <p style={{ fontSize: '14px', marginTop: '16px' }}>
                    Examples:<br/>
                    • "Schedule a meeting with John tomorrow at 2pm"<br/>
                    • "Buy groceries this weekend"<br/>
                    • "Finish the project report by Friday"
                  </p>
                </div>
              ) : (
                aiHistory.map((turn, idx) => (
                  <div key={idx} style={{ marginBottom: '16px' }}>
                    <div style={{ 
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: turn.role === 'user' 
                        ? 'var(--accent)' 
                        : 'var(--color-surface)',
                      color: turn.role === 'user' 
                        ? 'var(--accent-contrast)' 
                        : 'var(--color-text)',
                      marginLeft: turn.role === 'user' ? '40px' : '0',
                      marginRight: turn.role === 'assistant' ? '40px' : '0',
                      border: '1px solid var(--border-color)'
                    }}>
                      <strong>{turn.role === 'user' ? 'You' : 'AI Assistant'}:</strong>
                      <div style={{ marginTop: '4px' }}>{turn.content}</div>
                    </div>
                  </div>
                ))
              )}
              
              {aiLoading && (
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <Spin /> <span style={{ marginLeft: '8px', color: 'var(--color-muted)' }}>AI is thinking...</span>
                </div>
              )}

              {/* AI Candidates */}
              {aiCandidates.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <h4 style={{ margin: 0, color: 'var(--color-text)' }}>Proposed Tasks:</h4>
                    <Space>
                      <Button size="small" onClick={selectAllCandidates}>Select All</Button>
                      <Button size="small" onClick={deselectAllCandidates}>Deselect All</Button>
                    </Space>
                  </div>
                  
                  {aiCandidates.map((candidate) => (
                    <div 
                      key={candidate.id}
                      style={{
                        padding: '12px',
                        marginBottom: '8px',
                        border: `2px solid ${candidate.selected ? 'var(--accent)' : 'var(--border-color)'}`,
                        borderRadius: '8px',
                        background: candidate.selected ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--color-surface)',
                        cursor: 'pointer'
                      }}
                      onClick={() => toggleCandidate(candidate.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Checkbox 
                          checked={candidate.selected}
                          onChange={() => toggleCandidate(candidate.id)}
                        />
                        <strong style={{ color: 'var(--color-text)' }}>{candidate.title}</strong>
                      </div>
                      
                      {candidate.description && (
                        <p style={{ margin: '4px 0', color: 'var(--color-muted)', fontSize: '14px' }}>
                          {candidate.description}
                        </p>
                      )}
                      
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {candidate.category && (
                          <Tag color="purple">{candidate.category}</Tag>
                        )}
                        {candidate.priority && (
                          <Tag color={candidate.priority === 'high' ? 'red' : candidate.priority === 'medium' ? 'orange' : 'green'}>
                            {candidate.priority} priority
                          </Tag>
                        )}
                        {candidate.date && (
                          <Tag color="blue">{candidate.date}</Tag>
                        )}
                        {candidate.startTime && (
                          <Tag color="cyan">{candidate.startTime}</Tag>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <Button 
                      type="primary" 
                      onClick={addSelectedCandidates}
                      disabled={aiCandidates.filter(c => c.selected).length === 0}
                      style={{ 
                        background: 'var(--accent)', 
                        borderColor: 'var(--accent)',
                        color: 'var(--accent-contrast)'
                      }}
                    >
                      Add Selected Tasks ({aiCandidates.filter(c => c.selected).length})
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div style={{ 
              padding: '16px', 
              borderTop: '1px solid var(--border-color)',
              background: 'var(--color-surface)'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <TextArea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                  placeholder="Describe the tasks you want to create..."
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  disabled={aiLoading}
                  style={{ flex: 1 }}
                />
                <Button
                  type="primary"
                  onClick={handleAiSend}
                  loading={aiLoading}
                  disabled={!aiInput.trim()}
                  style={{ 
                    background: 'var(--accent)', 
                    borderColor: 'var(--accent)',
                    color: 'var(--accent-contrast)',
                    alignSelf: 'flex-end'
                  }}
                >
                  Send
                </Button>
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: 'var(--color-muted)', 
                marginTop: '8px',
                textAlign: 'center'
              }}>
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </div>
        </Drawer>

        {/* Floating Action Buttons */}
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 1000
        }}>
          {/* AI Assistant Button */}
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<RobotOutlined />}
            onClick={openAiDrawer}
            disabled={loading}
            style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              border: 'none',
              boxShadow: '0 4px 16px rgba(24, 144, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(24, 144, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(24, 144, 255, 0.4)';
            }}
            title="AI Assistant"
          />
          
          {/* Focus Mode Button */}
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<ThunderboltOutlined />}
            onClick={() => setIsFocusModeVisible(true)}
            disabled={loading}
            style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)',
              border: 'none',
              boxShadow: '0 4px 16px rgba(250, 140, 22, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(250, 140, 22, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(250, 140, 22, 0.4)';
            }}
            title="Focus Mode"
          />
        </div>
      </div>
    </div>
    </>
  );
};

export default Tasks;
