import * as sgMail from '@sendgrid/mail';
import * as admin from 'firebase-admin';
import {compile, registerPartial} from 'handlebars';
import {ENV_CONFIG} from '../consts/env-config.const';

export async function parseEmail(
  to: string,
  subject: string,
  template: string,
  context: any,
  loadTemplate = true,
  added?: any
) {
  let layout: string;
  let dbTemplate: string;

  if (!to) {
    console.error('Missing receiver email');
    return false;
  }

  const toExec = [
    admin
      .firestore()
      .doc(`settings/templates/templates/layout`)
      .get()
  ];

  if (loadTemplate) {
    toExec.push(
      admin
        .firestore()
        .doc(`settings/templates/templates/${template}`)
        .get()
    );
  }

  const [layoutDoc, templateDoc] = await Promise.all(toExec);

  if (!layoutDoc.exists) {
    console.error('Email layout document missing');
    return false;
  }

  if (templateDoc && !templateDoc.exists) {
    console.error('Email not sent because document is undefined');
    return false;
  }

  [layout, dbTemplate] = [layoutDoc, templateDoc].map(
    // @ts-ignore
    item => (item ? item.data().value : null)
  );

  if (!loadTemplate) {
    dbTemplate = template;
  }

  registerPartial('body', dbTemplate);

  const html = compile(layout)(context);

  sgMail.setApiKey(ENV_CONFIG.sendgrid.token);

  try {
    await sgMail.send({
      to,
      from: {
        name: 'Sanghamitra',
        email: 'info@sanghamitraphukan.com'
      },
      subject,
      text: 'Please use an HTML enabled client to view this email.',
      html,
      ...added
    });
  } catch (e) {
    console.error('Error sending email', e.toString());
  }

  return true;
}
