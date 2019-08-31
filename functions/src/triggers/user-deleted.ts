import * as functions from 'firebase-functions';
import {parseEmail} from '../utils/parse-email';
import * as admin from 'firebase-admin';

// TODO: Complete
export const userDeleted = functions.auth.user().onDelete(async user => {
  await Promise.all([
    admin
      .firestore()
      .collection('customers')
      .doc(user.uid)
      .delete(),
    parseEmail(user.email, 'Sanghamtira', 'user-deleted', user)
  ]);

  return true;
});
