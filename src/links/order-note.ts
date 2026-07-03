import { defineLink } from '@medusajs/framework/utils';
import OrderModule from '@medusajs/medusa/order';
import NoteModule from '../modules/note';

export default defineLink(OrderModule.linkable.order, NoteModule.linkable.note);
