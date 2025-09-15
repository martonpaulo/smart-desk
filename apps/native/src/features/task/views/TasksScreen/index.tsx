import { useState, useEffect } from 'react';
import { FAB } from 'react-native-paper';
import { useTaskStore } from 'src/features/task/store/useTaskStore';
import { Task } from '@smart-desk/types';
import { TaskFormData } from 'src/features/task/types/TaskTypes';
import { TaskList } from 'src/shared/components';
import { PageContainer } from 'src/shared/components';
import { SectionHeader } from 'src/shared/components';
import { TaskForm } from 'src/features/task/components/TaskForm';
import {
  Container,
  Content,
  StatsContainer,
  StatsText,
  fabStyle,
} from './styles';

export function TasksScreen() {
  const {
    tasks,
    isLoading,
    error,
    fetchTasks,
    refreshTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
  } = useTaskStore();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsFormVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormVisible(true);
  };

  const handleSaveTask = async (taskData: TaskFormData) => {
    try {
      if (editingTask) {
        await updateTask({
          id: editingTask.id,
          title: taskData.title,
          notes: taskData.notes || null,
          important: taskData.important,
          urgent: taskData.urgent,
          blocked: taskData.blocked,
          estimatedTime: taskData.estimatedTime || null,
          quantityTarget: taskData.quantityTarget,
          daily: taskData.daily,
          columnId: editingTask.columnId, // Keep existing column
        });
      } else {
        await addTask({
          title: taskData.title,
          notes: taskData.notes || null,
          important: taskData.important,
          urgent: taskData.urgent,
          blocked: taskData.blocked,
          estimatedTime: taskData.estimatedTime || null,
          quantityTarget: taskData.quantityTarget,
          daily: taskData.daily,
          columnId: 'default', // Default column for now
        });
      }
      setIsFormVisible(false);
      setEditingTask(null);
    } catch {
      // Error is handled by the store
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch {
      // Error is handled by the store
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      await toggleTaskComplete(taskId);
    } catch {
      // Error is handled by the store
    }
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
    setEditingTask(null);
  };

  const completedTasks = tasks.filter(
    task => task.quantityDone >= task.quantityTarget
  );
  const activeTasks = tasks.filter(
    task => task.quantityDone < task.quantityTarget
  );

  return (
    <PageContainer>
      <Container>
        <SectionHeader
          title='Tasks'
          subtitle={`${activeTasks.length} active, ${completedTasks.length} completed`}
        />

        <StatsContainer>
          <StatsText>
            Total: {tasks.length} tasks | Active: {activeTasks.length} |
            Completed: {completedTasks.length}
          </StatsText>
        </StatsContainer>

        <Content>
          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            error={error}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onRetry={refreshTasks}
            emptyMessage='No tasks yet. Tap the + button to add your first task!'
          />
        </Content>

        <FAB
          icon='plus'
          style={fabStyle}
          onPress={handleAddTask}
          label='Add Task'
        />

        <TaskForm
          visible={isFormVisible}
          onClose={handleCloseForm}
          task={editingTask}
          onSave={handleSaveTask}
          isLoading={isLoading}
        />
      </Container>
    </PageContainer>
  );
}
