import { View, Text } from 'react-native';
import styled from 'styled-components/native';

export const Container = styled(View)`
  flex: 1;
  background-color: #f5f5f5;
`;

export const ProfileContainer = styled(View)`
  background-color: #ffffff;
  margin: 8px;
  border-radius: 12px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
`;

export const UserInfo = styled(View)`
  padding: 24px;
  align-items: center;
`;

export const UserName = styled(Text)`
  font-size: 24px;
  font-weight: 600;
  margin-top: 16px;
  color: #212121;
`;

export const UserEmail = styled(Text)`
  font-size: 16px;
  color: #666;
  margin-top: 8px;
`;

export const MenuContainer = styled(View)`
  padding: 8px 0;
`;

export const LogoutButton = styled(View)`
  padding: 16px 24px;
`;

export const avatarStyle = {
  backgroundColor: '#6200ee',
};
