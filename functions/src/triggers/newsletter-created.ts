import * as functions from 'firebase-functions';
import {parseEmail} from '../utils/parse-email';

export const newsletterCreated = functions.firestore
  .document('newsletter/{id}')
  .onCreate(async snap => {
    const data: any = snap.data();

    console.log(data);

    if (data.discount) {
      const sent = await parseEmail(
        snap.id,
        'Sanghamitra - Discount Code',
        'receive-discount',
        {
          code: 'MP1CZU'
        }
      );
      console.log({
        sent,
        email: snap.id
      });
    }

    return true;
  });
