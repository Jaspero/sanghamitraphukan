import * as functions from 'firebase-functions';
import * as rp from 'request-promise-native';
import {ENV_CONFIG} from '../consts/env-config.const';
import {parseEmail} from '../utils/parse-email';

export const newsletterCreated = functions.firestore
  .document('newsletter/{id}')
  .onCreate(async snap => {

    const data: any = snap.data();

    if (data.discount) {
      await parseEmail(snap.id, 'Sanghamitra - Discount Code', 'receive-discount', {
        code: 'MP1CZU'
      });
    }

    try {
      await rp({
        method: 'POST',
        uri: `https://us20.api.mailchimp.com/3.0/lists/${ENV_CONFIG.mailchimp.list}/members/`,
        auth: {
          user: 'username',
          pass: ENV_CONFIG.mailchimp.token
        },
        body: {
          email_address: snap.id,
          status: 'subscribed'
        },
        json: true
      });
    } catch (e) {}

    return true;
  });
