import * as functions from 'firebase-functions';
import {parseEmail} from '../utils/parse-email';

export const sendDiscount = functions.https.onRequest(async (req, res) => {
  const email = req.body.email;
  if (!email) return;

  await parseEmail(email, 'Sanghamitra - Discount Code', 'receive-discount', {
    code: 'MP1CZU'
  });

  res.json({message: 'success'});
});
