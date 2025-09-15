import { View, Text } from 'react-native';
import styled from 'styled-components/native';

export const FormContainer = styled(View)`
  flex: 1;
  justify-content: center;
  padding: 20px;
  background-color: #f5f5f5;
`;

export const Title = styled(Text)`
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
  color: #212121;
`;

export const Subtitle = styled(Text)`
  font-size: 16px;
  text-align: center;
  margin-bottom: 32px;
  color: #666;
`;

export const Form = styled(View)`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
`;

export const SwitchContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
`;

export const SwitchLabel = styled(Text)`
  margin-left: 8px;
  font-size: 16px;
  color: #666;
`;

export const ButtonContainer = styled(View)`
  margin-top: 16px;
`;

export const ErrorText = styled(Text)`
  color: #d32f2f;
  font-size: 14px;
  text-align: center;
  margin-top: 16px;
`;
