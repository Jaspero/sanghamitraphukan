export interface Product {
  id: string;
  category: string;
  price: number;
  active: boolean;
  createdOn: number;
  name: string;
  shortDescription: string;
  description: string;
  gallery: string[];
  search: string[];
  fabric?: string;
  made?: string;
  latest?: boolean;
  size?: string[];
  instgramLink?: string;
  preOrder?: boolean;
}
