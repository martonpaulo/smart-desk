import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import CopyIcon from '@mui/icons-material/FileCopy';
import {
  IconButton,
  InputLabel,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { transitions } from '@/legacy/styles/transitions';
import { normalizeText, renderMarkdown } from '@/legacy/utils/markdownUtils';

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
  const { enqueueSnackbar } = useSnackbar();

  const [markdown, setMarkdown] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const theme = useTheme();

  // Autofocus when editing
  useEffect(() => {
    if (isEditing) textRef.current?.focus();
  }, [isEditing]);

  const finishEditing = useCallback(() => {
    const normalized = normalizeText(markdown);
    setMarkdown(normalized);
    onChange?.(normalized);
    setIsEditing(false);
  }, [markdown, onChange]);

  const handleToggle = (lineIndex: number) => {
    const lines = markdown.split(/\r?\n/);
    const regex = /^([*-]?\s*\[)(\s*x?\s*)(\])(\s*)(.*)$/i;
    const m = regex.exec(lines[lineIndex]);
    if (!m) return;

    const [, prefix, mark, closingBracket, spaceAfter, rest] = m;
    // Always use '[x]' or '[ ]' (no space between [ and x])
    const newMark = mark.trim().toLowerCase() === 'x' ? ' ' : 'x';
    lines[lineIndex] = `${prefix}${newMark}${closingBracket}${spaceAfter}${rest}`;

    const updated = lines.join('\n');
    setMarkdown(updated);
    onChange?.(updated);
  };

  const renderedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!renderedRef.current) return;
    const links = renderedRef.current.querySelectorAll('a');

    links.forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }, [markdown, isEditing]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      enqueueSnackbar('Copied to clipboard', { variant: 'success' });
    } catch (err) {
      console.error('Copy failed:', err);
      enqueueSnackbar('Failed to copy', { variant: 'error' });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    onChange?.(e.target.value);
  };

  const hasContent = markdown.length > 0;
  const inputBackground = theme.palette.grey[100];

  return (
    <Stack
      position="relative"
      onClick={hasContent ? undefined : () => setIsEditing(true)}
      padding={isEditing ? 0 : theme.spacing(2)}
      borderRadius={theme.shape.borderRadiusSmall}
      minHeight={isEditing ? 'unset' : theme.spacing(16)}
      sx={{
        wordBreak: 'break-word',
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
        <Stack>
          <Tooltip title="Edit content">
            <IconButton
              size="small"
              onClick={() => setIsEditing(true)}
              sx={{ position: 'absolute', top: theme.spacing(1), right: theme.spacing(1) }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>

          {hasContent && (
            <Tooltip title="Copy raw content">
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{ position: 'absolute', top: theme.spacing(1), right: theme.spacing(5) }}
              >
                <CopyIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
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
          onBlur={finishEditing}
        />
      ) : (
        <Stack ref={renderedRef}>
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
