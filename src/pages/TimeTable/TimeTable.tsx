import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { 
  Card, 
  Button as AntButton, 
  Modal, 
  Form, 
  Input, 
  Select, 
  TimePicker,
  Space,
  Tag,
  Tooltip,
  message,
  Row,
  Col,
  Divider,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  BookOutlined,
  EnvironmentOutlined,
  UserOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotifications } from '../../contexts/NotificationContext';
import type { Subject } from '../../services/timetableService';
import { 
  createSubject,
  updateSubject,
  deleteSubject,
  subscribeSubjects,
  getSubjectColors,
  getDayName,
  getDayShort,
  formatTimeRange,
  findScheduleConflicts,
  duplicateSubjectInDateRange,
} from '../../services/timetableService';
import { subscribeTodos } from '../../services/todoService';

const { Option } = Select;

const TimeTable: FC = () => {
  const { user, isLoggedIn } = useAuth();
  const { withLoading } = useLoading();
  const { addNotification } = useNotifications();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubjectModalVisible, setIsSubjectModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(dayjs().startOf('isoWeek'));
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    visible: boolean;
    id: string;
    name: string;
  }>({
    visible: false,
    id: '',
    name: ''
  });

  // Subscribe to subjects and todos
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const unsubscribeSubjects = subscribeSubjects(user.uid, (subjects) => {
      setSubjects(subjects);
      setLoading(false);
    });

    const unsubscribeTodos = subscribeTodos(user.uid, (todos) => {
      setTodos(todos);
    });

    return () => {
      unsubscribeSubjects();
      unsubscribeTodos();
    };
  }, [user?.uid]);

  // Check for conflicts when subjects or todos change
  useEffect(() => {
    const detectedConflicts = findScheduleConflicts(subjects, todos);
    setConflicts(detectedConflicts);
  }, [subjects, todos]);

  const handleAddSubject = () => {
    setEditingSubject(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'lecture',
      color: getSubjectColors()[0],
      semester: `${new Date().getFullYear()}-${new Date().getMonth() < 6 ? 'Spring' : 'Fall'}`,
      fromDate: dayjs().format('YYYY-MM-DD'),
      toDate: dayjs().add(3, 'month').format('YYYY-MM-DD'),
      timeSlots: []
    });
    setIsSubjectModalVisible(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    form.setFieldsValue({
      name: subject.name,
      code: subject.code,
      instructor: subject.instructor,
      location: subject.location,
      color: subject.color,
      credits: subject.credits,
      type: subject.type,
      semester: subject.semester,
      fromDate: dayjs(subject.fromDate).format('YYYY-MM-DD'),
      toDate: dayjs(subject.toDate).format('YYYY-MM-DD'),
      timeSlots: subject.timeSlots.map(slot => ({
        ...slot,
        startTime: dayjs(slot.startTime, 'HH:mm'),
        endTime: dayjs(slot.endTime, 'HH:mm')
      }))
    });
    setIsSubjectModalVisible(true);
  };

  const handleDeleteSubject = (subjectId: string, subjectName: string) => {
    setDeleteConfirmModal({
      visible: true,
      id: subjectId,
      name: subjectName
    });
  };

  const handleConfirmDelete = () => {
    if (!user?.uid) return;

    withLoading(async () => {
      await deleteSubject(user.uid, deleteConfirmModal.id);
      messageApi.success('Subject deleted successfully');
      
      setDeleteConfirmModal({
        visible: false,
        id: '',
        name: ''
      });
    });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmModal({
      visible: false,
      id: '',
      name: ''
    });
  };

  const validateTimeSlots = (timeSlots: any[]) => {
    if (!timeSlots || timeSlots.length === 0) {
      throw new Error('At least one time slot is required');
    }

    for (let i = 0; i < timeSlots.length; i++) {
      const slot = timeSlots[i];
      
      for (let j = i + 1; j < timeSlots.length; j++) {
        const otherSlot = timeSlots[j];
        
        if (slot.day === otherSlot.day) {
          const startTime = dayjs(slot.startTime);
          const endTime = dayjs(slot.endTime);
          const otherStartTime = dayjs(otherSlot.startTime);
          const otherEndTime = dayjs(otherSlot.endTime);
          
          const overlap = (startTime.isBefore(otherEndTime) && endTime.isAfter(otherStartTime));
          
          if (overlap) {
            throw new Error(`Time slots ${i + 1} and ${j + 1} overlap on the same day`);
          }
        }
      }
    }
  };

  const handleModalOk = () => {
    if (!user?.uid) return;

    withLoading(async () => {
      const values = await form.validateFields();

      try {
        validateTimeSlots(values.timeSlots);
      } catch (validationError: any) {
        messageApi.error(validationError.message);
        return;
      }

      const subjectData = {
        name: values.name,
        code: values.code,
        instructor: values.instructor || '',
        location: values.location || '',
        color: values.color,
        credits: values.credits,
        type: values.type,
        semester: values.semester,
        fromDate: values.fromDate,
        toDate: values.toDate,
        timeSlots: (values.timeSlots || []).map((slot: any) => ({
          day: slot.day,
          startTime: dayjs(slot.startTime).format('HH:mm'),
          endTime: dayjs(slot.endTime).format('HH:mm')
        }))
      };

      if (editingSubject) {
        await updateSubject(user.uid, editingSubject.id, subjectData);
        messageApi.success('Subject updated successfully');
      } else {
        const subjectId = await createSubject(user.uid, subjectData);
        messageApi.success('Subject created successfully');
        
        const newSubject = { ...subjectData, id: subjectId, userId: user.uid };
        await duplicateSubjectInDateRange(user.uid, newSubject as Subject);
        messageApi.success(`Subject duplicated from ${subjectData.fromDate} to ${subjectData.toDate}`);
      }
      
      const newSubjectForConflictCheck = {
        ...subjectData,
        id: editingSubject ? editingSubject.id : 'temp-id',
        userId: user.uid,
      };
      
      const otherSubjects = subjects.filter(s => s.id !== newSubjectForConflictCheck.id);
      const newConflicts = findScheduleConflicts([newSubjectForConflictCheck, ...otherSubjects], todos);

      if (newConflicts.length > 0) {
        newConflicts.forEach(conflict => {
          const message = conflict.type === 'subject'
            ? `Subject "${conflict.conflict.name}" conflicts with subject "${conflict.conflictsWith.name}"`
            : `Task "${conflict.conflict.title}" conflicts with subject "${conflict.conflictsWith.name}" on ${new Date(conflict.conflict.dueDate).toLocaleDateString()} (${conflict.conflict.startTime}-${conflict.conflict.endTime})`;
          addNotification(message, 'warning');
        });
      }

      setIsSubjectModalVisible(false);
      form.resetFields();
    });
  };

  const renderWeeklyGrid = () => {
    const days = Array.from({ length: 7 }, (_, i) => i);
    const HOUR_HEIGHT = 60;
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const formatHour = (hour: number) => {
      if (hour === 0) return '12:00 AM';
      if (hour < 12) return `${hour}:00 AM`;
      if (hour === 12) return '12:00 PM';
      return `${hour - 12}:00 PM`;
    };

    const timeToMinutes = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const getSubjectPosition = (startTime: string, endTime: string) => {
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);
      const duration = endMinutes - startMinutes;
      
      return {
        top: (startMinutes / 60) * HOUR_HEIGHT,
        height: Math.max(30, (duration / 60) * HOUR_HEIGHT),
        startHour: startMinutes / 60,
        duration: duration / 60
      };
    };
    
    return (
      <div style={{ 
        background: '#ffffff', 
        borderRadius: '16px', 
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        height: 'calc(100vh - 200px)'
      }}>
        <div style={{ 
          display: 'flex', 
          marginBottom: '16px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{ 
            width: '80px', 
            padding: '16px 12px', 
            background: '#f8f9fa', 
            borderRadius: '12px 0 0 12px',
            borderRight: '1px solid #f0f0f0'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#8c8c8c', textAlign: 'center' }}>TIME</div>
          </div>
          {days.map((day) => {
            const dayDate = selectedWeek.add(day, 'day');
            const isToday = dayDate.isSame(dayjs(), 'day');
            return (
              <div key={day} style={{ 
                flex: 1, 
                padding: '16px 12px', 
                textAlign: 'center',
                background: isToday ? 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' : '#f8f9fa',
                borderRadius: day === 6 ? '0 12px 12px 0' : '0',
                borderRight: day < 6 ? '1px solid #f0f0f0' : 'none'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: isToday ? 'rgba(255, 255, 255, 0.8)' : '#8c8c8c',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {getDayShort(dayDate.day())}
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: isToday ? '#ffffff' : '#262626'
                }}>
                  {dayDate.format('DD')}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ 
          height: 'calc(100vh - 320px)',
          overflow: 'auto',
          border: '1px solid #f0f0f0',
          borderRadius: '12px',
          background: '#fafafa'
        }}>
          <div style={{ display: 'flex', position: 'relative' }}>
            <div style={{ 
              width: '80px', 
              background: '#f8f9fa',
              position: 'sticky',
              left: 0,
              zIndex: 5,
              borderRight: '1px solid #f0f0f0'
            }}>
              {hours.map((hour) => (
                <div key={hour} style={{
                  height: `${HOUR_HEIGHT}px`,
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingTop: '8px',
                  position: 'relative'
                }}>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    color: '#8c8c8c',
                    textAlign: 'center',
                    lineHeight: '1'
                  }}>
                    {formatHour(hour)}
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: `${HOUR_HEIGHT / 2}px`,
                    right: '8px',
                    width: '8px',
                    height: '1px',
                    background: '#d9d9d9'
                  }} />
                </div>
              ))}
            </div>

            <div style={{ flex: 1, display: 'flex' }}>
              {days.map((day) => {
                const dayDate = selectedWeek.add(day, 'day');
                const isToday = dayDate.isSame(dayjs(), 'day');
                
                const daySubjects = subjects.filter(subject => {
                  const hasTimeSlot = subject.timeSlots.some(slot => slot.day === dayDate.day());
                  
                  if (!hasTimeSlot) return false;
                  
                  const currentDate = dayDate.format('YYYY-MM-DD');
                  const fromDate = subject.fromDate;
                  const toDate = subject.toDate;
                  
                  if (!fromDate || !toDate) return true;
                  
                  return currentDate >= fromDate && currentDate <= toDate;
                });

                return (
                  <div key={day} style={{ 
                    flex: 1, 
                    borderRight: day < 6 ? '1px solid #f0f0f0' : 'none',
                    position: 'relative',
                    background: isToday ? 'rgba(24, 144, 255, 0.02)' : '#ffffff'
                  }}>
                    {hours.map((hour) => (
                      <div key={hour} style={{
                        height: `${HOUR_HEIGHT}px`,
                        borderBottom: '1px solid #f5f5f5',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: `${HOUR_HEIGHT / 2}px`,
                          left: '0',
                          right: '0',
                          height: '1px',
                          background: '#fafafa'
                        }} />
                      </div>
                    ))}

                    {daySubjects.map((subject) => 
                      subject.timeSlots
                        .filter(slot => slot.day === dayDate.day())
                        .map((slot, slotIndex) => {
                          const position = getSubjectPosition(slot.startTime, slot.endTime);
                          
                          return (
                            <Tooltip 
                              key={`${subject.id}-${slotIndex}`}
                              title={
                                <div>
                                  <div><strong>{subject.name}</strong> ({subject.code})</div>
                                  {subject.instructor && <div>👨‍🏫 {subject.instructor}</div>}
                                  {subject.location && <div>📍 {subject.location}</div>}
                                  <div>⏰ {slot.startTime} - {slot.endTime}</div>
                                </div>
                              }
                            >
                              <div
                                style={{
                                  position: 'absolute',
                                  top: `${position.top}px`,
                                  left: '6px',
                                  right: '6px',
                                  height: `${position.height}px`,
                                  background: subject.color,
                                  color: '#ffffff',
                                  borderRadius: '8px',
                                  padding: '8px 10px',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                  border: `2px solid ${subject.color}`,
                                  zIndex: 3,
                                  transition: 'all 0.3s ease',
                                  overflow: 'hidden'
                                }}
                                onClick={() => handleEditSubject(subject)}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.02)';
                                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
                                  e.currentTarget.style.zIndex = '10';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                                  e.currentTarget.style.zIndex = '3';
                                }}
                              >
                                <div style={{
                                  fontSize: '0.8rem',
                                  fontWeight: '700',
                                  marginBottom: '4px',
                                  lineHeight: '1.2',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {subject.code}
                                </div>
                                
                                <div style={{
                                  fontSize: '0.7rem',
                                  opacity: 0.9,
                                  fontWeight: '500'
                                }}>
                                  {slot.startTime} - {slot.endTime}
                                </div>
                                
                                {subject.location && position.height > 50 && (
                                  <div style={{
                                    fontSize: '0.65rem',
                                    opacity: 0.8,
                                    marginTop: '2px'
                                  }}>
                                    📍 {subject.location}
                                  </div>
                                )}
                              </div>
                            </Tooltip>
                          );
                        })
                    )}

                    {isToday && (() => {
                      const now = new Date();
                      const currentHour = now.getHours() + now.getMinutes() / 60;
                      return (
                        <div style={{
                          position: 'absolute',
                          top: `${currentHour * HOUR_HEIGHT}px`,
                          left: '0',
                          right: '0',
                          height: '2px',
                          background: '#ff4d4f',
                          zIndex: 15,
                          boxShadow: '0 0 6px rgba(255, 77, 79, 0.6)'
                        }}>
                          <div style={{
                            position: 'absolute',
                            left: '-6px',
                            top: '-5px',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: '#ff4d4f',
                            boxShadow: '0 0 6px rgba(255, 77, 79, 0.6)'
                          }} />
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSubjectsList = () => (
    <Card 
      title="📚 My Subjects" 
      extra={
        <AntButton type="primary" icon={<PlusOutlined />} onClick={handleAddSubject}>
          Add Subject
        </AntButton>
      }
      style={{ marginBottom: '24px' }}
    >
      <div style={{ display: 'grid', gap: '12px' }}>
        {subjects.map((subject) => (
          <div key={subject.id} style={{
            background: '#fafafa',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      background: subject.color 
                    }} 
                  />
                  <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#262626' }}>
                    {subject.name}
                  </span>
                  <Tag color="blue">{subject.code}</Tag>
                  <Tag color="green">{subject.type}</Tag>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.85rem', color: '#666' }}>
                  {subject.instructor && (
                    <span><UserOutlined /> {subject.instructor}</span>
                  )}
                  {subject.location && (
                    <span><EnvironmentOutlined /> {subject.location}</span>
                  )}
                  {subject.credits && (
                    <span><BookOutlined /> {subject.credits} credits</span>
                  )}
                </div>

                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#8c8c8c', marginBottom: '4px' }}>
                    📅 Weekly Schedule:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {subject.timeSlots.map((slot, index) => (
                      <Tag key={index} color="purple" style={{ fontSize: '0.75rem' }}>
                        {getDayShort(slot.day)} {formatTimeRange(slot.startTime, slot.endTime)}
                      </Tag>
                    ))}
                  </div>
                </div>

                {subject.fromDate && subject.toDate && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#8c8c8c', marginBottom: '4px' }}>
                      🔄 Duplication Period:
                    </div>
                    <Tag color="cyan" style={{ fontSize: '0.75rem' }}>
                      Duplicate from {dayjs(subject.fromDate).format('DD/MM/YYYY')} to {dayjs(subject.toDate).format('DD/MM/YYYY')}
                    </Tag>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <AntButton 
                  size="small" 
                  icon={<EditOutlined />} 
                  onClick={() => handleEditSubject(subject)}
                />
                <AntButton 
                  size="small" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteSubject(subject.id, subject.name)}
                />
              </div>
            </div>
          </div>
        ))}
        
        {subjects.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            color: '#8c8c8c' 
          }}>
            <BookOutlined style={{ fontSize: '3rem', marginBottom: '16px' }} />
            <div>No subjects added yet. Create your first subject to get started!</div>
          </div>
        )}
      </div>
    </Card>
  );

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '40px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <BookOutlined style={{ fontSize: '4rem', color: '#000', marginBottom: '24px' }} />
              <h2>Login Required</h2>
              <p>Please log in to access your time table and manage your class schedule.</p>
            </div>
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
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-text)' }}>
              🎓 Time Table
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-muted)', marginBottom: '24px' }}>
              {loading ? 'Loading...' : `${subjects.length} subjects • Week of ${selectedWeek.format('MMM DD, YYYY')}`}
            </p>
            
            <Space wrap>
              <AntButton
                onClick={() => setSelectedWeek(selectedWeek.subtract(1, 'week'))}
              >
                ← Previous Week
              </AntButton>
              <AntButton
                onClick={() => setSelectedWeek(dayjs().startOf('isoWeek'))}
              >
                📅 This Week
              </AntButton>
              <AntButton
                onClick={() => setSelectedWeek(selectedWeek.add(1, 'week'))}
              >
                Next Week →
              </AntButton>
              <AntButton
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddSubject}
              >
                Add Subject
              </AntButton>
            </Space>
          </div>

          {/* Weekly Schedule Grid */}
          {renderWeeklyGrid()}

          {/* Subjects List */}
          <div style={{ marginTop: '24px' }}>
            {renderSubjectsList()}
          </div>

          {/* Add/Edit Subject Modal */}
          <Modal
            title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
            open={isSubjectModalVisible}
            onOk={handleModalOk}
            onCancel={() => {
              setIsSubjectModalVisible(false);
              form.resetFields();
            }}
            okText={editingSubject ? 'Update' : 'Add'}
            width={800}
          >
            <Form
              form={form}
              layout="vertical"
              name="subjectForm"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Subject Name"
                    name="name"
                    rules={[{ required: true, message: 'Please input the subject name!' }]}
                  >
                    <Input placeholder="e.g., Data Structures" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Course Code"
                    name="code"
                    rules={[{ required: true, message: 'Please input the course code!' }]}
                  >
                    <Input placeholder="e.g., CS201" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Instructor" name="instructor">
                    <Input placeholder="Professor name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Location" name="location">
                    <Input placeholder="Room/Building" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Type" name="type">
                    <Select>
                      <Option value="lecture">📖 Lecture</Option>
                      <Option value="lab">🧪 Lab</Option>
                      <Option value="tutorial">📝 Tutorial</Option>
                      <Option value="seminar">💬 Seminar</Option>
                      <Option value="other">📋 Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Credits" name="credits">
                    <Select placeholder="Select credits">
                      <Option value={1}>1 Credit</Option>
                      <Option value={2}>2 Credits</Option>
                      <Option value={3}>3 Credits</Option>
                      <Option value={4}>4 Credits</Option>
                      <Option value={5}>5 Credits</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Color" name="color">
                    <Select>
                      {getSubjectColors().map(color => (
                        <Option key={color} value={color}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                              width: '16px', 
                              height: '16px', 
                              borderRadius: '50%', 
                              background: color 
                            }} />
                            {color}
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Semester" name="semester">
                <Input placeholder="e.g., 2024-Spring" />
              </Form.Item>

              <Divider>📅 Weekly Schedule</Divider>
              
              <Form.List name="timeSlots">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} style={{ 
                        background: '#f8f9fa', 
                        padding: '16px', 
                        borderRadius: '8px', 
                        marginBottom: '12px' 
                      }}>
                        <Row gutter={16} align="middle">
                          <Col span={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'day']}
                              label="Day"
                              rules={[{ required: true, message: 'Select day' }]}
                            >
                              <Select placeholder="Day">
                                {Array.from({ length: 7 }, (_, i) => (
                                  <Option key={i} value={i}>{getDayName(i)}</Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={7}>
                            <Form.Item
                              {...restField}
                              name={[name, 'startTime']}
                              label="Start Time"
                              rules={[{ required: true, message: 'Select start time' }]}
                            >
                              <TimePicker 
                                format="HH:mm" 
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={7}>
                            <Form.Item
                              {...restField}
                              name={[name, 'endTime']}
                              label="End Time"
                              rules={[{ required: true, message: 'Select end time' }]}
                            >
                              <TimePicker 
                                format="HH:mm" 
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <AntButton 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />}
                              onClick={() => remove(name)}
                              style={{ marginTop: '30px' }}
                            >
                              Remove
                            </AntButton>
                          </Col>
                        </Row>
                      </div>
                    ))}
                    <Form.Item>
                      <AntButton 
                        type="dashed" 
                        onClick={() => add()} 
                        block 
                        icon={<PlusOutlined />}
                      >
                        Add Time Slot
                      </AntButton>
                    </Form.Item>
                  </>
                )}
              </Form.List>

              <Divider>🔄 Duplication Period</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="From Date"
                    name="fromDate"
                    rules={[{ required: true, message: 'Please select from date!' }]}
                  >
                    <Input type="date" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="To Date"
                    name="toDate"
                    rules={[{ required: true, message: 'Please select to date!' }]}
                  >
                    <Input type="date" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            title="Delete Subject"
            open={deleteConfirmModal.visible}
            onOk={handleConfirmDelete}
            onCancel={handleCancelDelete}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <p>Are you sure you want to delete the subject <strong>"{deleteConfirmModal.name}"</strong>?</p>
            <p>This action cannot be undone.</p>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default TimeTable;
