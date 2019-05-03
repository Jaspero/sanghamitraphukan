import * as sgMail from '@sendgrid/mail';
import {readFile} from 'fs';
import {compile} from 'handlebars';
import {promisify} from 'util';
import {ENV_CONFIG} from '../consts/env-config.const';

export async function parseEmail(
  to: string,
  subject: string,
  template: string,
  context: any
) {
  const templateFile = await promisify(readFile)(
    `./email-templates/${template}.hbs`
  );
  const html = compile(templateFile)(context);

  sgMail.setApiKey(ENV_CONFIG.sendgrid.token);

  sgMail
    .send({
      to,
      from: {
        name: 'Jaspero Ltd',
        email: 'info@jaspero.co'
      },
      subject,
      text: 'Please use an HTML enabled client to view this email.',
      html
    })
    .then()
    .catch(error => console.error(error));

  return true;
}
