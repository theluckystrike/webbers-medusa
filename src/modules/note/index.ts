import { Module } from '@medusajs/framework/utils';
import NoteService from './service';

export const NOTE = 'note';

export default Module(NOTE, {
  service: NoteService,
});
