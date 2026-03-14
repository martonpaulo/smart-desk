import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_LANGUAGE } from '@/features/i18n/constants/languages';
import { LanguageSelector } from '@/features/preferences/components/language-selector';

const useAuthUserIdMock = vi.fn();
const getLanguagePreferenceMock = vi.fn();
const upsertLanguagePreferenceMock = vi.fn();

const translations: Record<string, string> = {
  'language.label': 'Language',
  'language.english': 'English',
  'language.spanish': 'Spanish',
};

const i18nMock: {
  resolvedLanguage: string;
  changeLanguage: ReturnType<typeof vi.fn>;
} = {
  resolvedLanguage: DEFAULT_LANGUAGE,
  changeLanguage: vi.fn(async (nextLanguage: string) => {
    i18nMock.resolvedLanguage = nextLanguage;
  }),
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => translations[key] ?? key,
    i18n: i18nMock,
  }),
}));

vi.mock('@/features/tasks/hooks/use-auth-user-id', () => ({
  useAuthUserId: () => useAuthUserIdMock(),
}));

vi.mock('@/features/preferences/logic/language-preference', () => ({
  getLanguagePreference: (...args: unknown[]) => getLanguagePreferenceMock(...args),
  upsertLanguagePreference: (...args: unknown[]) => upsertLanguagePreferenceMock(...args),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  DropdownMenuRadioGroup: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    children: ReactNode;
  }) => (
    <select
      aria-label="language-options"
      value={value}
      onChange={event => {
        onValueChange(event.target.value);
      }}
    >
      {children}
    </select>
  ),
  DropdownMenuRadioItem: ({ children, value }: { children: ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
}));

function renderLanguageSelector() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <LanguageSelector />
    </QueryClientProvider>,
  );
}

describe('LanguageSelector', () => {
  beforeEach(() => {
    i18nMock.resolvedLanguage = DEFAULT_LANGUAGE;
    i18nMock.changeLanguage.mockClear();
    useAuthUserIdMock.mockReset();
    getLanguagePreferenceMock.mockReset();
    upsertLanguagePreferenceMock.mockReset();
    getLanguagePreferenceMock.mockResolvedValue(DEFAULT_LANGUAGE);
    upsertLanguagePreferenceMock.mockResolvedValue(undefined);
  });

  it('renders a loading skeleton while auth is loading', () => {
    useAuthUserIdMock.mockReturnValue({ userId: null, isLoading: true });

    const { container } = renderLanguageSelector();

    const skeleton = container.querySelector('.animate-pulse');

    expect(skeleton).toBeInTheDocument();
    expect(screen.queryByLabelText('language-options')).not.toBeInTheDocument();
  });

  it('does not force fallback to English when auth is resolved and no user is present', async () => {
    const user = userEvent.setup();
    useAuthUserIdMock.mockReturnValue({ userId: null, isLoading: false });

    renderLanguageSelector();

    await user.selectOptions(screen.getByLabelText('language-options'), 'es');

    expect(i18nMock.changeLanguage).toHaveBeenCalledTimes(1);
    expect(i18nMock.changeLanguage).toHaveBeenCalledWith('es');
  });

  it('applies persisted user language preference after loading', async () => {
    useAuthUserIdMock.mockReturnValue({ userId: 'user-1', isLoading: false });
    getLanguagePreferenceMock.mockResolvedValue('es');

    renderLanguageSelector();

    await waitFor(() => {
      expect(i18nMock.changeLanguage).toHaveBeenCalledWith('es');
    });
  });
});
