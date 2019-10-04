import * as functions from 'firebase-functions';
import * as rp from 'request-promise-native';
import {ENV_CONFIG} from '../consts/env-config.const';

export const ipData = functions.https.onCall(async context => {
  const ip = context.rawRequest.connection.remoteAddress;

  let data: any;

  try {
    data = await rp(
      `https://api.ipdata.co/${ip}?api-key=${ENV_CONFIG.ipdata.apiKey}`
    );
  } catch (e) {}

  console.log('raw', ip);
  return data;
});
