import { View, Text } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import styled from 'styled-components/native';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'large';
}

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const LoadingText = styled(Text)`
  margin-top: 16px;
  font-size: 16px;
  color: #666;
  text-align: center;
`;

export function LoadingSpinner({
  text = 'Loading...',
  size = 'large',
}: LoadingSpinnerProps) {
  return (
    <LoadingContainer>
      <ActivityIndicator size={size} color='#6200ee' />
      {text && <LoadingText>{text}</LoadingText>}
    </LoadingContainer>
  );
}
