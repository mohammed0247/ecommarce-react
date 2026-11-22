export interface Category {
  _id: string;
  id?: string;
  name: string;
  slug?: string;
  image?: string;
}

export interface Brand {
  _id: string;
  id?: string;
  name: string;
  slug?: string;
  image?: string;
}

export interface Product {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  imageCover: string;
  images?: string[];
  price: number;
  priceAfterDiscount?: number;
  quantity?: number;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  category?: Category;
  brand?: Brand;
}

export interface CartProduct extends Product {}

export interface CartLine {
  _id?: string;
  count: number;
  price: number;
  product: CartProduct;
}

export interface CartData {
  _id?: string;
  cartId?: string;
  products: CartLine[];
  totalCartPrice?: number;
  totalPrice?: number;
}

export interface ApiList<T> {
  data: T[];
  results?: number;
  metadata?: {
    currentPage?: number;
    numberOfPages?: number;
    limit?: number;
  };
}

export interface ApiObject<T> {
  data: T;
  message?: string;
  token?: string;
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
}

export interface Order {
  _id: string;
  createdAt?: string;
  totalOrderPrice?: number;
  paymentMethodType?: string;
  isPaid?: boolean;
  isDelivered?: boolean;
  cartItems?: CartLine[];
}
