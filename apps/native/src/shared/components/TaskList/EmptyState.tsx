import { View, Text } from 'react-native';
import { IconButton, Button } from 'react-native-paper';
import styled from 'styled-components/native';

interface EmptyStateProps {
  message: string;
  icon?: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
`;

const EmptyIcon = styled(IconButton)`
  margin-bottom: 16px;
`;

const EmptyText = styled(Text)`
  font-size: 16px;
  color: #666;
  text-align: center;
  margin-bottom: 20px;
`;

const ActionButton = styled(Button)`
  background-color: #6200ee;
`;

export function EmptyState({
  message,
  icon = 'inbox',
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <EmptyContainer>
      <EmptyIcon icon={icon} size={48} iconColor='#ccc' />
      <EmptyText>{message}</EmptyText>
      {actionText && onAction && (
        <ActionButton mode='contained' onPress={onAction}>
          {actionText}
        </ActionButton>
      )}
    </EmptyContainer>
  );
}
