
import type { FunctionCardData } from './types';
import type { CreateFunction, EditFunction } from './types';

export const CREATE_FUNCTIONS: FunctionCardData[] = [
  { id: 'free' as CreateFunction, name: 'Prompt', icon: '✨' },
  { id: 'sticker' as CreateFunction, name: 'Adesivos', icon: '🏷️' },
  { id: 'text' as CreateFunction, name: 'Logo', icon: '📝' },
  { id: 'comic' as CreateFunction, name: 'HQ', icon: '💭' },
];

export const EDIT_FUNCTIONS: FunctionCardData[] = [
  { id: 'add-remove' as EditFunction, name: 'Adicionar', icon: '➕' },
  { id: 'retouch' as EditFunction, name: 'Retoque', icon: '🎯' },
  { id: 'style' as EditFunction, name: 'Estilo', icon: '🎨' },
  { id: 'compose' as EditFunction, name: 'Unir', icon: '🖼️', requiresTwo: true },
];
