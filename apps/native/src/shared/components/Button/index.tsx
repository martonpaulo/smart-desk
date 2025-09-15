import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import styled from 'styled-components/native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const StyledButton = styled(TouchableOpacity)<{
  variant: 'primary' | 'secondary' | 'outline';
  size: 'small' | 'medium' | 'large';
  disabled: boolean;
}>`
  background-color: ${({ variant, disabled }) => {
    if (disabled) return '#e0e0e0';
    switch (variant) {
      case 'primary':
        return '#6200ee';
      case 'secondary':
        return '#03dac6';
      case 'outline':
        return 'transparent';
      default:
        return '#6200ee';
    }
  }};
  border: ${({ variant }) =>
    variant === 'outline' ? '2px solid #6200ee' : 'none'};
  border-radius: 8px;
  padding: ${({ size }) => {
    switch (size) {
      case 'small':
        return '8px 16px';
      case 'medium':
        return '12px 24px';
      case 'large':
        return '16px 32px';
      default:
        return '12px 24px';
    }
  }};
  align-items: center;
  justify-content: center;
  min-height: ${({ size }) => {
    switch (size) {
      case 'small':
        return '36px';
      case 'medium':
        return '48px';
      case 'large':
        return '56px';
      default:
        return '48px';
    }
  }};
`;

const ButtonText = styled(Text)<{
  variant: 'primary' | 'secondary' | 'outline';
  disabled: boolean;
}>`
  color: ${({ variant, disabled }) => {
    if (disabled) return '#9e9e9e';
    switch (variant) {
      case 'primary':
        return '#ffffff';
      case 'secondary':
        return '#000000';
      case 'outline':
        return '#6200ee';
      default:
        return '#ffffff';
    }
  }};
  font-size: 16px;
  font-weight: 600;
  text-align: center;
`;

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  if (icon) {
    return (
      <PaperButton
        mode={variant === 'outline' ? 'outlined' : 'contained'}
        onPress={onPress}
        disabled={disabled || loading}
        loading={loading}
        icon={icon}
        style={style}
        labelStyle={textStyle}
      >
        {title}
      </PaperButton>
    );
  }

  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled || loading}
      onPress={onPress}
      style={style}
      activeOpacity={0.7}
    >
      <ButtonText variant={variant} disabled={disabled} style={textStyle}>
        {loading ? 'Loading...' : title}
      </ButtonText>
    </StyledButton>
  );
}
