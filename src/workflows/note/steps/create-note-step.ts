import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { NOTE } from '../../../modules/note';
import NoteModuleService from '../../../modules/note/service';

type CreateNoteStepInput = {
  note: string;
};

export const createNoteStep = createStep(
  'create-note-step',
  async (input: CreateNoteStepInput, { container }) => {
    const noteModuleService: NoteModuleService = container.resolve(NOTE);

    const note = await noteModuleService.createNotes({
      note: input.note,
    });

    return new StepResponse(note, note.id);
  },
  async (noteId, { container }) => {
    if (!noteId) {
      return;
    }

    const noteModuleService: NoteModuleService = container.resolve(NOTE);
    await noteModuleService.deleteNotes(noteId);
  }
);
