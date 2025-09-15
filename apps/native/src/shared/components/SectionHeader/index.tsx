import { View, Text } from 'react-native';
import styled from 'styled-components/native';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: object;
}

const HeaderContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #ffffff;
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
`;

const TitleContainer = styled(View)`
  flex: 1;
`;

const Title = styled(Text)`
  font-size: 20px;
  font-weight: 600;
  color: #212121;
  margin-bottom: 4px;
`;

const Subtitle = styled(Text)`
  font-size: 14px;
  color: #666;
`;

const ActionContainer = styled(View)`
  margin-left: 16px;
`;

export function SectionHeader({
  title,
  subtitle,
  action,
  style,
}: SectionHeaderProps) {
  return (
    <HeaderContainer style={style}>
      <TitleContainer>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </TitleContainer>
      {action && <ActionContainer>{action}</ActionContainer>}
    </HeaderContainer>
  );
}
