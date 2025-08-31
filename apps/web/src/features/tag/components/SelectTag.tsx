import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

import { useTagsStore } from '@/features/tag/store/useTagsStore';
import { Tag } from '@/features/tag/types/Tag';

type SelectTagProps = {
  tagId?: string;
  onChange: (tagId?: string, tag?: Tag) => void;
};

export function SelectTag({ tagId, onChange }: SelectTagProps) {
  const allTags = useTagsStore(s => s.items);
  const tags = allTags.filter(t => !t.trashed).sort((a, b) => a.name.localeCompare(b.name));

  const findTagById = (id?: string) => (id ? allTags.find(t => t.id === id) : undefined);
  const selectedTag = findTagById(tagId);

  const handleChange = (e: SelectChangeEvent<string>) => {
    const newId = e.target.value || undefined;
    onChange(newId, findTagById(newId));
  };

  return (
    <FormControl fullWidth variant="outlined">
      {/* Keep label always floated to avoid drop on empty value */}
      <InputLabel id="select-tag-label" shrink>
        Tag
      </InputLabel>

      <Select<string>
        labelId="select-tag-label"
        label="Tag" // important for outlined Select so label doesn't jump
        value={tagId ?? ''}
        size="small"
        onChange={handleChange}
        displayEmpty
        sx={{
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          },
        }}
        renderValue={val => {
          // Show a circle in the input for both selected and "No tag"
          if (!val) {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.8 }}>
                <span>No tag</span>
              </Box>
            );
          }
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                component="span"
                sx={theme => ({
                  width: theme.spacing(2),
                  height: theme.spacing(2),
                  borderRadius: '50%',
                  backgroundColor: selectedTag?.color,
                })}
              />
              <span>{selectedTag?.name}</span>
            </Box>
          );
        }}
      >
        <MenuItem value="">No tag</MenuItem>

        {tags.map(t => (
          <MenuItem key={t.id} value={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={theme => ({
                backgroundColor: t.color,
                width: theme.spacing(2),
                height: theme.spacing(2),
                borderRadius: '50%',
              })}
            />
            {t.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
