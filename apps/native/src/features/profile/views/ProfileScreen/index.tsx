import { Alert } from 'react-native';
import { List, Avatar, Divider } from 'react-native-paper';
import { useAuthStore } from 'src/features/auth/store/useAuthStore';
import { PageContainer } from 'src/shared/components';
import { Button } from 'src/shared/components';
import { SectionHeader } from 'src/shared/components';
import {
  Container,
  ProfileContainer,
  UserInfo,
  UserName,
  UserEmail,
  MenuContainer,
  LogoutButton,
  avatarStyle,
} from './styles';

export function ProfileScreen() {
  const { user, logout, isLoading } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch {
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <PageContainer>
      <Container>
        <SectionHeader title='Profile' />

        <ProfileContainer>
          <UserInfo>
            <Avatar.Text
              size={80}
              label={user?.email?.charAt(0).toUpperCase() || 'U'}
              style={avatarStyle}
            />
            <UserName>{user?.email || 'User'}</UserName>
            <UserEmail>{user?.email || 'No email'}</UserEmail>
          </UserInfo>

          <Divider />

          <MenuContainer>
            <List.Item
              title='Account Settings'
              description='Manage your account preferences'
              left={props => <List.Icon {...props} icon='cog' />}
              right={props => <List.Icon {...props} icon='chevron-right' />}
              onPress={() => {
                // Navigate to settings
              }}
            />
            <List.Item
              title='Notifications'
              description='Configure notification preferences'
              left={props => <List.Icon {...props} icon='bell' />}
              right={props => <List.Icon {...props} icon='chevron-right' />}
              onPress={() => {
                // Navigate to notifications
              }}
            />
            <List.Item
              title='Help & Support'
              description='Get help and contact support'
              left={props => <List.Icon {...props} icon='help-circle' />}
              right={props => <List.Icon {...props} icon='chevron-right' />}
              onPress={() => {
                // Navigate to help
              }}
            />
            <List.Item
              title='About'
              description='App version and information'
              left={props => <List.Icon {...props} icon='information' />}
              right={props => <List.Icon {...props} icon='chevron-right' />}
              onPress={() => {
                // Navigate to about
              }}
            />
          </MenuContainer>

          <Divider />

          <LogoutButton>
            <Button
              title='Logout'
              onPress={handleLogout}
              loading={isLoading}
              variant='outline'
            />
          </LogoutButton>
        </ProfileContainer>
      </Container>
    </PageContainer>
  );
}
