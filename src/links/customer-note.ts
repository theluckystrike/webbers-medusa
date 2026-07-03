import { defineLink } from '@medusajs/framework/utils';
import CustomerModule from '@medusajs/medusa/customer';
import NoteModule from '../modules/note';

export default defineLink(CustomerModule.linkable.customer, NoteModule.linkable.note);
