import { FlatList, View, StyleSheet, ListRenderItem } from 'react-native';
import styled from 'styled-components/native';
import { Task } from '@smart-desk/types';
import { TaskItem } from 'src/shared/components/TaskList/TaskItem';
import { EmptyState } from 'src/shared/components/TaskList/EmptyState';
import { LoadingSpinner } from 'src/shared/components/TaskList/LoadingSpinner';
import { ErrorMessage } from 'src/shared/components/TaskList/ErrorMessage';

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  error?: string | null;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onTaskPress?: (task: Task) => void;
  onRetry?: () => void;
  emptyMessage?: string;
}

const ListContainer = styled(View)`
  flex: 1;
  background-color: #f5f5f5;
`;

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const ErrorContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

export function TaskList({
  tasks,
  isLoading = false,
  error,
  onToggleComplete,
  onEdit,
  onDelete,
  onTaskPress,
  onRetry,
  emptyMessage = 'No tasks found',
}: TaskListProps) {
  const renderTask: ListRenderItem<Task> = ({ item }) => (
    <TaskItem
      task={item}
      onToggleComplete={onToggleComplete}
      onEdit={onEdit}
      onDelete={onDelete}
      onPress={onTaskPress}
    />
  );

  const keyExtractor = (item: Task) => item.id;

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner text='Loading tasks...' />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorMessage message={error} onRetry={onRetry} retryText='Retry' />
      </ErrorContainer>
    );
  }

  if (tasks.length === 0) {
    return (
      <LoadingContainer>
        <EmptyState message={emptyMessage} />
      </LoadingContainer>
    );
  }

  return (
    <ListContainer>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </ListContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },
});
