import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { NOTE } from '../../../modules/note';
import NoteModuleService from '../../../modules/note/service';

type UpdateNoteStepInput = {
  note: string;
  id: string;
};

export const updateNoteStep = createStep(
  'update-note-step',
  async (input: UpdateNoteStepInput, { container }) => {
    const noteModuleService: NoteModuleService = container.resolve(NOTE);

    const prevData = await noteModuleService.retrieveNote(input.id);

    const note = await noteModuleService.updateNotes({
      note: input.note,
      id: input.id,
    });

    return new StepResponse(note, prevData);
  },
  async (prevData, { container }) => {
    const noteModuleService: NoteModuleService = container.resolve(NOTE);

    if (!prevData) {
      return;
    }

    await noteModuleService.updateNotes(prevData);
  }
);
