import {initializeApp} from 'firebase-admin';

initializeApp();

// Triggers
export {userCreated} from './triggers/user-created';
// export {userDeleted} from './triggers/user-deleted';
export {contactCreated} from './triggers/contact-created';
export {fileCreated} from './triggers/file-created';
export {fileDeleted} from './triggers/file-deleted';
export {newsletterCreated} from './triggers/newsletter-created';
export {customerDeleted} from './triggers/customer-deleted';

// Rest
export {exportData} from './rest/export-data';
export {importData} from './rest/import-data';
export {similarProducts} from './rest/similar-products';
export {stripe} from './rest/stripe';
export {instagram} from './rest/instagram-authorization';

// export {ssr} from './ssr';
