import { Task } from 'src/legacy/types/task';

/**
 * Converts a task object to CSV row format
 * Handles null/undefined values and escapes special characters
 */
function taskToCsvRow(task: Task): string {
  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatDateTime = (date: Date | null | undefined): string => {
    if (!date) return '';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const escapeCsvValue = (value: string | number | boolean | null | undefined): string => {
    if (value === null || value === undefined) return '';

    const stringValue = String(value);

    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  return [
    escapeCsvValue(task.title),
    escapeCsvValue(task.notes || ''),
    escapeCsvValue(task.important),
    escapeCsvValue(task.urgent),
    escapeCsvValue(task.blocked),
    escapeCsvValue(task.daily),
    escapeCsvValue(task.trashed),
    escapeCsvValue(task.quantityDone),
    escapeCsvValue(task.quantityTarget),
    escapeCsvValue(task.estimatedTime ? `${task.estimatedTime} min` : ''),
    escapeCsvValue(formatDate(task.plannedDate)),
    escapeCsvValue(formatDate(task.classifiedDate)),
    escapeCsvValue(formatDateTime(task.createdAt)),
    escapeCsvValue(formatDateTime(task.updatedAt)),
    escapeCsvValue(task.columnId),
    escapeCsvValue(task.tagId || ''),
    escapeCsvValue(task.eventId || ''),
    escapeCsvValue(task.position),
  ].join(',');
}

/**
 * Exports tasks to CSV format and triggers download
 * @param tasks - Array of tasks to export
 * @param filename - Optional filename for the downloaded file
 */
export function exportTasksToCsv(tasks: Task[], filename?: string): void {
  if (tasks.length === 0) {
    console.warn('No tasks to export');
    return;
  }

  // CSV headers
  const headers = [
    'Title',
    'Notes',
    'Important',
    'Urgent',
    'Blocked',
    'Daily',
    'Trashed',
    'Quantity Done',
    'Quantity Target',
    'Estimated Time',
    'Planned Date',
    'Classified Date',
    'Created At',
    'Updated At',
    'Column ID',
    'Tag ID',
    'Event ID',
    'Position',
  ];

  // Convert tasks to CSV rows
  const csvRows = [headers.join(','), ...tasks.map(taskToCsvRow)];

  // Join all rows with newlines
  const csvContent = csvRows.join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      filename || `tasks-export-${new Date().toISOString().split('T')[0]}.csv`,
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
