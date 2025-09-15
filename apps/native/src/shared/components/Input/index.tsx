import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import styled from 'styled-components/native';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (_text: string) => void;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
}

const InputContainer = styled(View)`
  margin-bottom: 16px;
`;

const ErrorText = styled(Text)`
  color: #d32f2f;
  font-size: 12px;
  margin-top: 4px;
  margin-left: 12px;
`;

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  style,
  inputStyle,
  disabled = false,
}: InputProps) {
  return (
    <InputContainer style={style}>
      <PaperTextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        mode='outlined'
        multiline={multiline}
        numberOfLines={numberOfLines}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        disabled={disabled}
        error={!!error}
        style={inputStyle}
        theme={{
          colors: {
            primary: '#6200ee',
            error: '#d32f2f',
          },
        }}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </InputContainer>
  );
}
