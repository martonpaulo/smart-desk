import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from 'src/features/auth/store/useAuthStore';
import { LoginForm } from 'src/features/auth/components/LoginForm';
import { TasksScreen } from 'src/features/task/views/TasksScreen';
import { ProfileScreen } from 'src/features/profile/views/ProfileScreen';
import { RootStackParamList, MainTabParamList } from '@smart-desk/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

          if (route.name === 'Tasks') {
            iconName = focused ? 'check-circle' : 'check-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          } else {
            iconName = 'help-circle-outline';
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name='Tasks'
        component={TasksScreen}
        options={{
          title: 'Tasks',
          headerTitle: 'Smart Desk',
        }}
      />
      <Tab.Screen
        name='Profile'
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerTitle: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    // You could show a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name='Main' component={MainTabs} />
        ) : (
          <Stack.Screen name='Auth' component={LoginForm} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
