import * as functions from 'firebase-functions';
import {STATIC_CONFIG} from '../consts/static-config.const';
import {parseEmail} from '../utils/parse-email';
import * as rp from 'request-promise-native';

export const newsletterCreated = functions.firestore
  .document('newsletter/{id}')
  .onCreate(async snap => {
    const data: any = snap.data();

    if (data.discount) {

      const doc = await rp({
        method: 'POST',
        uri: 'https://sanghamitraphukan.com/assets/pdf/sanghamitra_hvc_care.pdf',
        encoding: null
      });

      await Promise.all([
        parseEmail(
          snap.id,
          'Sanghamitra - Discount Code',
          'receive-discount',
          {
            code: 'MP1CZU'
          },
          true,
          {
            attachments: [{
              content: new Buffer(doc).toString('base64'),
              filename: 'Sanghamtira_hvc_care.pdf',
              type: 'application/pdf',
              disposition: 'attachment',
              contentId: 'hvc'
            }]
          }
        ),
        parseEmail(
          STATIC_CONFIG.adminEamil,
          'New HVC care signup',
          'admin-sign-up-notification',
          {
            email: snap.id
          }
        )
      ]);
    }

    return true;
  });
