import { useState, useEffect } from 'react';
import { Modal, Portal, Chip } from 'react-native-paper';
import { Task } from '@smart-desk/types';
import { TaskFormData } from 'src/features/task/types/TaskTypes';
import { Input } from 'src/shared/components';
import { Button } from 'src/shared/components';
import {
  ModalContainer,
  Title,
  Form,
  ChipContainer,
  ButtonContainer,
  modalContentStyle,
} from './styles';

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  task?: Task | null;
  onSave: (taskData: TaskFormData) => void;
  isLoading?: boolean;
}

export function TaskForm({
  visible,
  onClose,
  task,
  onSave,
  isLoading = false,
}: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    notes: '',
    important: false,
    urgent: false,
    blocked: false,
    estimatedTime: undefined,
    quantityTarget: 1,
    daily: false,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        notes: task.notes || '',
        important: task.important,
        urgent: task.urgent,
        blocked: task.blocked,
        estimatedTime: task.estimatedTime || undefined,
        quantityTarget: task.quantityTarget,
        daily: task.daily,
      });
    } else {
      setFormData({
        title: '',
        notes: '',
        important: false,
        urgent: false,
        blocked: false,
        estimatedTime: undefined,
        quantityTarget: 1,
        daily: false,
      });
    }
  }, [task, visible]);

  const handleInputChange = (
    field: keyof TaskFormData,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      return;
    }
    onSave(formData);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      notes: '',
      important: false,
      urgent: false,
      blocked: false,
      estimatedTime: undefined,
      quantityTarget: 1,
      daily: false,
    });
    onClose();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={modalContentStyle}
      >
        <ModalContainer>
          <Title>{task ? 'Edit Task' : 'Add New Task'}</Title>

          <Form showsVerticalScrollIndicator={false}>
            <Input
              label='Title *'
              value={formData.title}
              onChangeText={value => handleInputChange('title', value)}
              placeholder='Enter task title'
            />

            <Input
              label='Notes'
              value={formData.notes || ''}
              onChangeText={value => handleInputChange('notes', value)}
              placeholder='Add notes (optional)'
              multiline
              numberOfLines={3}
            />

            <Input
              label='Estimated Time (minutes)'
              value={formData.estimatedTime?.toString() || ''}
              onChangeText={value =>
                handleInputChange(
                  'estimatedTime',
                  value ? parseInt(value) || 0 : 0
                )
              }
              placeholder='Enter estimated time'
              keyboardType='numeric'
            />

            <Input
              label='Quantity Target'
              value={formData.quantityTarget.toString()}
              onChangeText={value =>
                handleInputChange('quantityTarget', parseInt(value) || 1)
              }
              placeholder='Enter quantity target'
              keyboardType='numeric'
            />

            <ChipContainer>
              <Chip
                selected={formData.important}
                onPress={() =>
                  handleInputChange('important', !formData.important)
                }
                mode='outlined'
              >
                Important
              </Chip>
              <Chip
                selected={formData.urgent}
                onPress={() => handleInputChange('urgent', !formData.urgent)}
                mode='outlined'
              >
                Urgent
              </Chip>
              <Chip
                selected={formData.blocked}
                onPress={() => handleInputChange('blocked', !formData.blocked)}
                mode='outlined'
              >
                Blocked
              </Chip>
              <Chip
                selected={formData.daily}
                onPress={() => handleInputChange('daily', !formData.daily)}
                mode='outlined'
              >
                Daily
              </Chip>
            </ChipContainer>
          </Form>

          <ButtonContainer>
            <Button
              title='Cancel'
              onPress={handleClose}
              variant='outline'
              style={{ flex: 1 }}
            />
            <Button
              title={task ? 'Update' : 'Create'}
              onPress={handleSave}
              loading={isLoading}
              disabled={isLoading || !formData.title.trim()}
              style={{ flex: 1 }}
            />
          </ButtonContainer>
        </ModalContainer>
      </Modal>
    </Portal>
  );
}
