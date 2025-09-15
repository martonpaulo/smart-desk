import { View, Text, TouchableOpacity } from 'react-native';
import { Checkbox, IconButton } from 'react-native-paper';
import styled from 'styled-components/native';
import { Task } from '@smart-desk/types';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (_taskId: string) => void;
  onEdit: (_task: Task) => void;
  onDelete: (_taskId: string) => void;
  onPress?: (_task: Task) => void;
}

const TaskContainer = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  background-color: #ffffff;
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
`;

const TaskContent = styled(View)`
  flex: 1;
  margin-left: 12px;
`;

const TaskTitle = styled(Text)<{ completed: boolean }>`
  font-size: 16px;
  font-weight: 500;
  color: ${({ completed }) => (completed ? '#9e9e9e' : '#212121')};
  text-decoration-line: ${({ completed }) =>
    completed ? 'line-through' : 'none'};
  margin-bottom: 4px;
`;

const TaskDescription = styled(Text)`
  font-size: 14px;
  color: #666;
`;

const ActionButtons = styled(View)`
  flex-direction: row;
  align-items: center;
`;

export function TaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onPress,
}: TaskItemProps) {
  return (
    <TaskContainer onPress={() => onPress?.(task)}>
      <Checkbox
        status={
          task.quantityDone >= task.quantityTarget ? 'checked' : 'unchecked'
        }
        onPress={() => onToggleComplete(task.id)}
      />
      <TaskContent>
        <TaskTitle completed={task.quantityDone >= task.quantityTarget}>
          {task.title}
        </TaskTitle>
        {task.notes && <TaskDescription>{task.notes}</TaskDescription>}
      </TaskContent>
      <ActionButtons>
        <IconButton icon='pencil' size={20} onPress={() => onEdit(task)} />
        <IconButton icon='delete' size={20} onPress={() => onDelete(task.id)} />
      </ActionButtons>
    </TaskContainer>
  );
}
