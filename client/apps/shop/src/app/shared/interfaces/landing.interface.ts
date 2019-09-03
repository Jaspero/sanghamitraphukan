export interface Landing {
  featuredImage: string;
  featuredImageDesktop: string;
  products: Array<{id: string, image: string}>;
  category: string;
  title: string;
}
