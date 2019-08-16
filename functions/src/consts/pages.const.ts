import * as admin from 'firebase-admin';
import {setServerState} from '../utils/set-server-state';

export const PAGE_SUFFIX = ' | Sanghamitra';
export const PAGE_PREFIX = '';

export interface PageData {
  name: string;
  match: RegExp;
  operation?: (capture: string[], document) => Promise<void>;
  meta?: {[key: string]: string};
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
    operation: async (capture, document) => {
      // TODO: Language
      const product = await admin
        .firestore()
        .collection('news-en')
        .doc(capture[1])
        .get();

      if (!product.exists) {
        throw new Error('Article Missing');
      }

      const data = product.data();

      // TODO: Structured data
      document.title = PAGE_PREFIX + data.name + PAGE_SUFFIX;
      document.querySelector(`meta[name=description]`).content =
        data.shortDescription;
      setServerState({product: data}, document);
    }
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
    }
  },
  {
    name: 'Product',
    match: /^\/product\/(?:([^\/]+?))\/?$/i,
    operation: async (capture, document) => {
      // TODO: Language
      const product = await admin
        .firestore()
        .collection('products-en')
        .doc(capture[1])
        .get();

      if (!product.exists) {
        throw new Error('Product missing');
      }

      const data = product.data();

      // TODO: Structured data
      document.title = PAGE_PREFIX + data.name + PAGE_SUFFIX;
      document.querySelector(`meta[name=description]`).content =
        data.shortDescription;
      setServerState({product: data}, document);
    }
  }
];

export const DEFAULT_META = {
  description: 'A modern pwa webshop built on Firebase with Angular',
  keywords: 'e-commerce,angular,firebase,pwa'
};
