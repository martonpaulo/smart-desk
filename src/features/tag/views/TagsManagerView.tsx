'use client';

import { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, IconButton, Stack, Typography } from '@mui/material';

import { PageSection } from '@/core/components/PageSection';
import { TagLabel } from '@/features/tag/components/TagLabel';
import { useTagsStore } from '@/features/tag/store/TagsStore';
import { Tag } from '@/features/tag/types/Tag';
import { TagModal } from '@/legacy/components/TagModal';
import { useBoardStore } from '@/legacy/store/board/store';

export function TagsManagerView() {
  const allTags = useTagsStore(s => s.items);
  const tags = allTags.filter(t => !t.trashed).sort((a, b) => a.position - b.position);
  const addTag = useTagsStore(s => s.add);
  const updateTag = useTagsStore(s => s.update);
  const deleteTag = useTagsStore(s => s.softDelete);

  const tasks = useBoardStore(s => s.tasks);
  const updateTask = useBoardStore(s => s.updateTask);

  const [editing, setEditing] = useState<Tag | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (tag?: Tag) => {
    setEditing(tag || null);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSave = async (name: string, color: string, prevPos?: number) => {
    const now = new Date();
    if (editing) {
      await updateTag({
        id: editing.id,
        name,
        color,
        position: prevPos ?? editing.position,
        updatedAt: now,
      });
    } else {
      const position = tags.length > 0 ? Math.max(...tags.map(t => t.position)) + 1 : 0;
      await addTag({ name, color, position, createdAt: now });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteTag?.(id);
    const affected = tasks.filter(t => t.tagId === id);
    const now = new Date();
    await Promise.all(
      affected.map(t => updateTask({ id: t.id, tagId: undefined, updatedAt: now })),
    );
  };

  return (
    <PageSection
      title="Tags Manager"
      description="Create, edit, and remove tags used to classify your tasks"
    >
      <Stack direction="row" mb={2}>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={() => openModal()}>
          Add Tag
        </Button>
      </Stack>

      {tags.length === 0 && <Typography>No tags created yet.</Typography>}

      <Stack gap={1} mb={2}>
        {tags.map(tag => (
          <Stack key={tag.id} direction="row" alignItems="center">
            <TagLabel tag={tag} size="medium" onClick={() => openModal(tag)} />

            {deleteTag && (
              <IconButton size="small" onClick={() => handleDelete(tag.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        ))}
      </Stack>

      <TagModal
        open={modalOpen}
        tag={editing}
        prevPosition={editing?.position}
        onSave={handleSave}
        onDelete={deleteTag ? handleDelete : undefined}
        onClose={closeModal}
      />
    </PageSection>
  );
}
