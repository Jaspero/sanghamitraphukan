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
  'og:url': 'https://sanghamitraphukan.com',
  'og:title': 'Sanghamitra',
  'og:description':
    'The Universal Friend, our latest ‘laid back couture’ and evening wear collections, made from Muga Silk and other precious indigenous fabrics from the Northeast',
  'og:image': 'https://sanghamitraphukan.com/assets/images/logo-full.png',

  'twitter:card': 'summary_large_image',
  'twitter:url': 'https://sanghamitraphukan.com',
  'twitter:title': 'Sanghamitra',
  'twitter:description':
    'The Universal Friend, our latest ‘laid back couture’ and evening wear collections, made from Muga Silk and other precious indigenous fabrics from the Northeast',
  'twitter:image': 'https://sanghamitraphukan.com/assets/images/logo-full.png'
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
  stateKey?: string,
  additionalCriteria?: (item: any) => boolean
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

  const data = item.data() as any;

  if (additionalCriteria) {
    if (!additionalCriteria(item)) {
      throw new Error('Item missing');
    }
  }

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
    },
    metaProperties: {
      'og:url': 'https://sanghamitraphukan.com/about',
      'og:title': 'About',
      'og:description':
        'We are an Indo-Italian fashion design and lifestyle brand, aiming to Simplify and Re-value Sustainably',

      'twitter:url': 'https://sanghamitraphukan.com/about',
      'twitter:title': 'About',
      'twitter:description':
        'We are an Indo-Italian fashion design and lifestyle brand, aiming to Simplify and Re-value Sustainably'
    }
  },
  {
    name: 'Silk Road',
    match: /^\/silk-road\/?$/i,
    meta: {
      description: 'Sanghamitra Silk Road - New Face Hunt'
    },
    metaProperties: {
      'og:url': 'https://sanghamitraphukan.com/silk-road',
      'og:title': 'Silk Road',
      'og:description':
        'Sanghamitra Silk Road - New Face Hunt',
      'twitter:url': 'https://sanghamitraphukan.com/silk-road',
      'twitter:title': 'Silk Road',
      'twitter:description':
        'Sanghamitra Silk Road - New Face Hunt'
    }
  },
  {
    name: 'News',
    match: /^\/news\/?$/i,
    meta: {
      description:
        'Follow SANGHAMITRA’s latest news and developments, connect to our instagram account and become a member to gain access to our events'
    },
    metaProperties: {
      'og:url': 'https://sanghamitraphukan.com/news',
      'og:title': 'News',
      'og:description':
        'Follow SANGHAMITRA’s latest news and developments, connect to our instagram account and become a member to gain access to our events',

      'twitter:url': 'https://sanghamitraphukan.com/news',
      'twitter:title': 'News',
      'twitter:description':
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
        item => ({
          description: item.shortDescription
        }),
        item => ({
          'og:url': 'https://sanghamitraphukan.com/news/' + capture[1],
          'og:title': item.title,
          'og:description': item.shortDescription,
          ...(item.gallery && item.gallery[0]
            ? {'og:image': item.gallery[0]}
            : {}),

          'twitter:url': 'https://sanghamitraphukan.com/news/' + capture[1],
          'twitter:title': item.title,
          'twitter:description': item.shortDescription,
          ...(item.gallery && item.gallery[0]
            ? {'twitter:image': item.gallery[0]}
            : {})
        }),
        'news'
      )
  },
  {
    name: 'Contact',
    match: /^\/contact\/?$/i,
    meta: {
      description:
        'Contact us for customised orders, bespoke traditional wear/ silk saris and consultations'
    },
    metaProperties: {
      'og:url': 'https://sanghamitraphukan.com/contact',
      'og:title': 'Contact',
      'og:description':
        'Contact us for customised orders, bespoke traditional wear/ silk saris and consultations',

      'twitter:url': 'https://sanghamitraphukan.com/contact',
      'twitter:title': 'Contact',
      'twitter:description':
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
      'og:url': 'https://sanghamitraphukan.com/shop',
      'og:title': 'Shop',
      'og:description':
        'Browse through and shop our collections of handmade garments, produced through traditional techniques using exclusively natural fabrics',

      'twitter:url': 'https://sanghamitraphukan.com/shop',
      'twitter:title': 'Shop',
      'twitter:description':
        'Browse through and shop our collections of handmade garments, produced through traditional techniques using exclusively natural fabrics'
    }
  },
  {
    name: 'Collections',
    match: /^\/collections\/?$/i,
    meta: {
      description:
        'Browse through our collections of handmade garments, produced through traditional techniques using exclusively natural fabrics'
    },
    metaProperties: {
      'og:url': 'https://sanghamitraphukan.com/collections',
      'og:title': 'Collections',
      'og:description':
        'Browse through our collections of handmade garments, produced through traditional techniques using exclusively natural fabrics',

      'twitter:url': 'https://sanghamitraphukan.com/collections',
      'twitter:title': 'Collections',
      'twitter:description':
        'Browse through our collections of handmade garments, produced through traditional techniques using exclusively natural fabrics'
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
          'og:url': `https://sanghamitraphukan.com/product/${capture[1]}`,
          'og:title': item.name,
          'og:description': item.shortDescription,
          ...(item.gallery && item.gallery[0]
            ? {'og:image': item.gallery[0]}
            : {}),

          'twitter:url': `https://sanghamitraphukan.com/product/${capture[1]}`,
          'twitter:title': item.name,
          'twitter:description': item.shortDescription,
          ...(item.gallery && item.gallery[0]
            ? {'twitter:image': item.gallery[0]}
            : {})
        }),
        'product',
        item => item.active
      );
    }
  }
];
