import * as functions from 'firebase-functions';
import {STATIC_CONFIG} from '../consts/static-config.const';
import {parseEmail} from '../utils/parse-email';

export const modelApplicationCreated = functions.firestore
  .document('model-applications/{id}')
  .onCreate(async snap => {
    const data: any = snap.data();
    await parseEmail(
      STATIC_CONFIG.adminEamil,
      'New Model Application',
      'admin-model-application-created',
      data
    );
    return true;
  });
