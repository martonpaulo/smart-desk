import { View, Text } from 'react-native';
import { IconButton, Button } from 'react-native-paper';
import styled from 'styled-components/native';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

const ErrorContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const ErrorIcon = styled(IconButton)`
  margin-bottom: 16px;
`;

const ErrorText = styled(Text)`
  font-size: 16px;
  color: #d32f2f;
  text-align: center;
  margin-bottom: 20px;
`;

const RetryButton = styled(Button)`
  background-color: #6200ee;
`;

export function ErrorMessage({
  message,
  onRetry,
  retryText = 'Retry',
}: ErrorMessageProps) {
  return (
    <ErrorContainer>
      <ErrorIcon icon='alert-circle' size={48} iconColor='#d32f2f' />
      <ErrorText>{message}</ErrorText>
      {onRetry && (
        <RetryButton mode='contained' onPress={onRetry}>
          {retryText}
        </RetryButton>
      )}
    </ErrorContainer>
  );
}
