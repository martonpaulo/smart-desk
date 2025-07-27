import {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import EditIcon from '@mui/icons-material/Edit';
import { IconButton, InputLabel, Stack, TextField, Typography, useTheme } from '@mui/material';

import { transitions } from '@/legacy/styles/transitions';
import { renderMarkdown } from '@/legacy/utils/markdownUtils';

interface MarkdownEditableBoxProps {
  value: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function MarkdownEditableBox({
  value,
  onChange,
  label,
  placeholder,
}: MarkdownEditableBoxProps) {
  const [markdown, setMarkdown] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();

  // Autofocus when editing
  useEffect(() => {
    if (isEditing) textRef.current?.focus();
  }, [isEditing]);

  const finishEditing = useCallback(() => {
    setMarkdown(value.trim());
    setIsEditing(false);
  }, [value]);

  // Save on outside click
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        finishEditing();
        onChange?.(markdown);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [finishEditing, isEditing, markdown, onChange]);

  const handleToggle = (line: number) => {
    const lines = markdown.split(/\r?\n/);
    const target = lines[line];
    if (target.startsWith('- [ ] ')) {
      lines[line] = target.replace('- [ ] ', '- [x] ');
    } else if (target.startsWith('- [x] ')) {
      lines[line] = target.replace('- [x] ', '- [ ] ');
    }
    const updated = lines.join('\n');
    setMarkdown(updated);
    onChange?.(updated);
  };

  const handleCopy = (e: ClipboardEvent<HTMLDivElement | HTMLTextAreaElement>) => {
    e.preventDefault();
    e.clipboardData.setData('text/plain', markdown);
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    onChange?.(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      finishEditing();
    } else if (
      (e.key === 'Enter' && e.shiftKey) ||
      (e.key === 'Enter' && (e.metaKey || e.ctrlKey))
    ) {
      e.preventDefault();
      finishEditing();
    }
  };

  const hasContent = markdown.length > 0;
  const inputBackground = theme.palette.grey[100];

  return (
    <Stack
      ref={containerRef}
      onCopy={handleCopy}
      position="relative"
      onClick={hasContent ? undefined : () => setIsEditing(true)}
      padding={isEditing ? 0 : theme.spacing(2)}
      borderRadius={theme.shape.borderRadiusSmall}
      minHeight={isEditing ? 'unset' : theme.spacing(16)}
      sx={{
        backgroundColor: isEditing ? 'unset' : inputBackground,
        border: isEditing || hasContent ? 'unset' : `1px solid ${inputBackground}`,
        transition: transitions.input,
        '&:hover': {
          boxSizing: 'border-box',
          border: isEditing || hasContent ? 'unset' : `1px solid ${theme.palette.text.primary}`,
          borderColor: hasContent ? 'unset' : theme.palette.text.secondary,
        },
      }}
    >
      {!isEditing && (
        <IconButton
          size="small"
          onClick={() => setIsEditing(true)}
          sx={{ position: 'absolute', top: theme.spacing(1), right: theme.spacing(1) }}
        >
          <EditIcon />
        </IconButton>
      )}

      {!isEditing && label && hasContent && <InputLabel shrink>{label}</InputLabel>}

      {isEditing ? (
        <TextField
          label={label}
          placeholder={placeholder}
          inputRef={textRef}
          minRows={4}
          multiline
          fullWidth
          value={markdown}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <Stack spacing={0.5}>
          {hasContent ? (
            renderMarkdown(markdown, handleToggle)
          ) : (
            <Typography color={theme.palette.text.disabled}>{placeholder}</Typography>
          )}
        </Stack>
      )}
    </Stack>
  );
}
