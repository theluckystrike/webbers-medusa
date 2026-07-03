import { createWorkflow, transform, WorkflowResponse } from '@medusajs/framework/workflows-sdk';
import { createNoteStep } from './steps/create-note-step';
import { NOTE } from '../../modules/note';
import { createRemoteLinkStep } from '@medusajs/medusa/core-flows';

type CreateNoteWorkflowInput = {
  note: string;
  moduleType: { module: string; idName: string };
  type_id: string;
};

export const createNoteWorkflow = createWorkflow('create-note', (input: CreateNoteWorkflowInput) => {
  const note = createNoteStep(input);

  const link = transform({ moduleType: input.moduleType, typeId: input.type_id, note }, data => {
    const newLink = {
      [data?.moduleType?.module]: {
        [data?.moduleType?.idName]: data.typeId,
      },
      [NOTE]: {
        note_id: data.note.id,
      },
    };

    return [newLink];
  });

  createRemoteLinkStep(link);

  return new WorkflowResponse({ note });
});
