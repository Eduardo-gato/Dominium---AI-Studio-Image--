
export type Mode = 'create' | 'edit';
export type CreateFunction = 'free' | 'sticker' | 'text' | 'comic';
export type EditFunction = 'add-remove' | 'retouch' | 'style' | 'compose';

export interface FunctionCardData {
  id: CreateFunction | EditFunction;
  name: string;
  icon: string;
  requiresTwo?: boolean;
}
