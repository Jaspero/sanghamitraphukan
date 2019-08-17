import * as admin from 'firebase-admin';
import {setServerState} from '../utils/set-server-state';

export const PAGE_SUFFIX = ' | Sanghamitra';
export const PAGE_PREFIX = '';
export const DEFAULT_META = {
  description:
    'The Universal Friend, our latest ‘laid back couture’ and evening wear collections, made from Muga Silk and other precious indigenous fabrics from the Northeast',
  keywords: 'e-commerce,muga silk,evening wear'
};

export const DEFAULT_META_PROPERTIES = {
  'og:type': 'website',
  'og:url': 'https://fireshop.jaspero.co',
  'og:title': 'Jaspero Fireshop',
  'og:description': 'A modern pwa webshop built on Firebase with Angular',
  'og:image': 'https://fireshop.jaspero.co/assets/images/fireshop.svg',

  'twitter:card': 'summary_large_image',
  'twitter:url': 'https://fireshop.jaspero.co',
  'twitter:title': 'Jaspero Fireshop',
  'twitter:description': 'A modern pwa webshop built on Firebase with Angular',
  'twitter:image': 'https://fireshop.jaspero.co/assets/images/fireshop.svg'
};

export type Meta = {[key: string]: string};

export interface PageData {
  name: string;
  match: RegExp;
  operation?: (capture: string[], document) => Promise<void>;
  meta?: Meta;
  metaProperties?: Meta;
}

export async function loadItem(
  document,
  collection: string,
  id: string,
  titleKey: string,
  meta?: (item: any) => Meta,
  metaProperties?: (item: any) => Meta,
  stateKey?: string
) {
  // TODO: Language
  const item = await admin
    .firestore()
    .collection(collection)
    .doc(id)
    .get();

  if (!item.exists) {
    throw new Error('Item missing');
  }

  const data = item.data();

  // TODO: Structured data
  document.title = PAGE_PREFIX + data[titleKey] + PAGE_SUFFIX;

  let metaSet: Meta = DEFAULT_META;
  let metaPropertiesSet: Meta = DEFAULT_META_PROPERTIES;

  if (meta) {
    metaSet = {
      ...DEFAULT_META,
      ...(meta(data) || {})
    };
  }

  if (metaProperties) {
    metaPropertiesSet = {
      ...DEFAULT_META_PROPERTIES,
      ...(metaProperties(data) || {})
    };
  }

  Object.entries(metaSet).forEach(([key, value]) => {
    document.querySelector(`meta[name=${key}]`).content = value;
  });

  Object.entries(metaPropertiesSet).forEach(([key, value]) => {
    document.querySelector(`meta[property=${key}]`).content = value;
  });

  if (stateKey) {
    setServerState({[stateKey]: data}, document);
  }
}

export const PAGES: PageData[] = [
  {
    name: 'Home',
    match: /^\/?$/i,
    meta: {
      description:
        'The Universal Friend, our latest ‘laid back couture’ and evening wear collections, made from Muga Silk and other precious indigenous fabrics from the Northeast'
    }
  },
  {
    name: 'About us',
    match: /^\/about\/?$/i,
    meta: {
      description:
        'We are an Indo-Italian fashion design and lifestyle brand, aiming to Simplify and Re-value Sustainably'
    }
  },
  {
    name: 'News',
    match: /^\/news\/?$/i,
    meta: {
      description:
        'Follow SANGHAMITRA’s latest news and developments, connect to our instagram account and become a member to gain access to our events'
    }
  },
  {
    name: 'Single News',
    match: /^\/news\/(?:([^\/]+?))\/?$/i,
    operation: (capture, document) =>
      loadItem(
        document,
        'news-en',
        capture[1],
        'title',
        'shortDescription',
        'news'
      )
  },
  {
    name: 'Contact',
    match: /^\/contact\/?$/i,
    meta: {
      description:
        'Contact us for customised orders, bespoke traditional wear/ silk saris and consultations'
    }
  },
  {
    name: 'Shop',
    match: /^\/shop\/?$/i,
    meta: {
      description:
        'Browse through and shop our collections of handmade garments, produced through traditional techniques using exclusively natural fabrics'
    },
    metaProperties: {
      'og:url': 'https://fireshop.jaspero.co/shop',
      'og:title': 'Shop',
      'og:description':
        'Browse through and shop our collections of handmade garments, produced through traditional techniques using exclusively natural fabrics',

      'twitter:url': 'https://fireshop.jaspero.co/shop',
      'twitter:title': 'Shop',
      'twitter:description':
        'Browse through and shop our collections of handmade garments, produced through traditional techniques using exclusively natural fabrics'
    }
  },
  {
    name: 'Product',
    match: /^\/product\/(?:([^\/]+?))\/?$/i,
    operation: (capture, document) => {
      return loadItem(
        document,
        'products-en',
        capture[1],
        'name',
        item => ({
          description: item.shortDescription
        }),
        item => ({
          'og:url': `https://fireshop.jaspero.co/product/${capture[1]}`,
          'og:title': item.name,
          'og:description': item.shortDescription,

          'twitter:url': `https://fireshop.jaspero.co/product/${capture[1]}`,
          'twitter:title': item.name,
          'twitter:description': item.shortDescription
        }),
        'product'
      );
    }
  }
];
