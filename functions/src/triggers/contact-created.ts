import * as functions from 'firebase-functions';
import {STATIC_CONFIG} from '../consts/static-config.const';
import {parseEmail} from '../utils/parse-email';

export const contactCreated = functions.firestore
  .document('contacts/{id}')
  .onCreate(async snap => {
    const data = snap.data();
    await parseEmail(STATIC_CONFIG.adminEamil, 'Website Inquiry', 'contact-created', data);
    return true;
  });
