import {auth, firestore} from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as rp from 'request-promise-native';
import {ENV_CONFIG} from '../consts/env-config.const';
import {parseEmail} from '../utils/parse-email';

export const userCreated = functions.auth.user().onCreate(async user => {
  const documentRef = await firestore()
    .doc('settings/user')
    .get();
  const roles = (documentRef.data() || {}).roles || [];
  const role = roles.find(ro => ro.email === user.email);

  if (role) {
    const customClaims = {
      role: role.role
    };

    // Set custom user claims on this newly created user.
    await auth().setCustomUserClaims(user.uid, customClaims);
  } else {
    await Promise.all([
      parseEmail(
        user.email,
        'Welcome to Sanghamtira',
        'new-user-signed-up',
        user
      ),
      parseEmail(
        user.email,
        'New shop sign-up',
        'admin-sign-up-notification',
        user
      )
    ]);

    try {
      await rp({
        method: 'POST',
        uri: `https://us20.api.mailchimp.com/3.0/lists/${ENV_CONFIG.mailchimp.list}/members/`,
        auth: {
          user: 'username',
          pass: ENV_CONFIG.mailchimp.token
        },
        body: {
          email_address: user.email,
          status: 'subscribed'
        },
        json: true
      });
    } catch (e) {
      console.error(e);
    }
  }

  return true;
});
