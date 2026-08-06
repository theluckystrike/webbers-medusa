import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { uploadFilesWorkflow } from '@medusajs/medusa/core-flows';
import { MedusaError } from '@medusajs/framework/utils';
import { AdminUploadFile } from '@medusajs/framework/types';

export const POST = async (req: MedusaRequest<AdminUploadFile>, res: MedusaResponse) => {
  const access = 'public';
  const input = req.files as Express.Multer.File[];

  if (!input?.length) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, 'No files were uploaded');
  }

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: input?.map(f => ({
        filename: `reviews/${Date.now().toString()}-${f.originalname}`,
        mimeType: f.mimetype,
        content: f.buffer.toString('base64'),
        access,
      })),
    },
  });

  res.status(200).json({ files: result });
};
