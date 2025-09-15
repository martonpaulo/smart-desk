import { View, ScrollView, Text } from 'react-native';
import styled from 'styled-components/native';

export const ModalContainer = styled(View)`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin: 20px;
  max-height: 80%;
`;

export const Title = styled(Text)`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #212121;
`;

export const Form = styled(ScrollView)`
  flex: 1;
`;

export const Row = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
`;

export const Label = styled(Text)`
  font-size: 16px;
  color: #666;
  margin-right: 12px;
  min-width: 100px;
`;

export const ChipContainer = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

export const ButtonContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
  gap: 12px;
`;

export const modalContentStyle = {
  backgroundColor: 'transparent',
};
