import { MedusaService } from '@medusajs/framework/utils';
import { Note } from './models/note';

export default class NoteService extends MedusaService({
  Note,
}) {}
