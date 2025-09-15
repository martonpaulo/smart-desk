import { Text, View } from 'react-native';

import styled from 'styled-components/native';

export const Container = styled(View)`
  flex: 1;
  background-color: #f5f5f5;
`;

export const Content = styled(View)`
  flex: 1;
`;

export const StatsContainer = styled(View)`
  background-color: #ffffff;
  padding: 16px;
  margin: 8px;
  border-radius: 8px;
  elevation: 1;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
`;

export const StatsText = styled(Text)`
  font-size: 14px;
  color: #666;
  text-align: center;
`;

export const fabStyle = {
  position: 'absolute' as const,
  margin: 16,
  right: 0,
  bottom: 0,
  backgroundColor: '#6200ee',
};
