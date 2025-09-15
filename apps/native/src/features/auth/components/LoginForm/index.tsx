import { useState } from 'react';
import { Alert } from 'react-native';
import { Switch } from 'react-native-paper';
import { useAuthStore } from 'src/features/auth/store/useAuthStore';
import { Input } from 'src/shared/components';
import { Button } from 'src/shared/components';
import { PageContainer } from 'src/shared/components';
import {
  LoginCredentials,
  RegisterCredentials,
} from 'src/features/auth/types/AuthTypes';
import {
  FormContainer,
  Title,
  Subtitle,
  Form,
  SwitchContainer,
  SwitchLabel,
  ButtonContainer,
  ErrorText,
} from './styles';

export function LoginForm() {
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<
    LoginCredentials & RegisterCredentials
  >({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        });
      }
    } catch {
      // Error is handled by the store
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '', confirmPassword: '' });
    clearError();
  };

  return (
    <PageContainer>
      <FormContainer>
        <Title>Smart Desk</Title>
        <Subtitle>
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </Subtitle>

        <Form>
          <SwitchContainer>
            <Switch
              value={isLogin}
              onValueChange={toggleMode}
              color='#6200ee'
            />
            <SwitchLabel>{isLogin ? 'Sign In' : 'Sign Up'}</SwitchLabel>
          </SwitchContainer>

          <Input
            label='Email'
            value={formData.email}
            onChangeText={value => handleInputChange('email', value)}
            placeholder='Enter your email'
            keyboardType='email-address'
            autoCapitalize='none'
          />

          <Input
            label='Password'
            value={formData.password}
            onChangeText={value => handleInputChange('password', value)}
            placeholder='Enter your password'
            secureTextEntry
          />

          {!isLogin && (
            <Input
              label='Confirm Password'
              value={formData.confirmPassword}
              onChangeText={value =>
                handleInputChange('confirmPassword', value)
              }
              placeholder='Confirm your password'
              secureTextEntry
            />
          )}

          <ButtonContainer>
            <Button
              title={isLogin ? 'Sign In' : 'Sign Up'}
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
            />
          </ButtonContainer>

          {error && <ErrorText>{error}</ErrorText>}
        </Form>
      </FormContainer>
    </PageContainer>
  );
}
