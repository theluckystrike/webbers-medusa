import { createWorkflow, WorkflowResponse } from '@medusajs/framework/workflows-sdk';
import { updateNoteStep } from './steps/update-note-step';

type UpdateNoteWorkflowInput = {
  id: string;
  note: string;
};

export const updateNoteWorkflow = createWorkflow('update-note', (input: UpdateNoteWorkflowInput) => {
  const note = updateNoteStep(input);

  return new WorkflowResponse(note);
});
