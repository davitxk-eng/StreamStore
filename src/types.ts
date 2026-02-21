export interface Service {
  id: number;
  name: string;
  logo: string;
}

export interface Product {
  id: number;
  service_id: number;
  name: string;
  price: number;
  description: string;
  observations: string;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Slide {
  id: number;
  message: string;
  image: string;
}
