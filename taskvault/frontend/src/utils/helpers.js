import * as Icons from 'lucide-react';

export const initials = (name = 'User') => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

export const avatarColor = (name = '') => {
  const colors = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];
  const index = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export const iconFor = (name = 'tag') => {
  const key = name.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  return Icons[key] || Icons.Tag;
};

export const formatDate = (value) => value ? new Date(value).toLocaleDateString() : 'No date';
export const isOverdue = (value, status) => value && status !== 'DONE' && new Date(value) < new Date(new Date().toDateString());
export const statusLabel = (status) => ({ TODO: 'Todo', IN_PROGRESS: 'In Progress', DONE: 'Done' }[status] || status);
export const priorityColor = (priority) => ({ LOW: 'success', MEDIUM: 'warning', HIGH: 'danger' }[priority] || 'accent');
