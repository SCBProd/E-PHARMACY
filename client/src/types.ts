export interface Product {
  id: string;
  name: string;
  price: number;
  photo: string;
  suppliers?: string;
  category?: string;
  stock?: number;
  description?: string;
  medicinalUses?: string;
  warnings?: string;
  rating?: number | null;
  duplicateOf?: string | number;
  quantity?: number;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  rating: number;
  status: string;
  nearest?: boolean;
}

export interface Review {
  _id?: string;
  name: string;
  testimonial: string;
  photo?: string;
  rating?: number;
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  login: (data: AuthResponse) => void;
  logout: () => Promise<void>;
}

export interface CartContextValue {
  items: CartItem[];
  count: number;
  updateQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
}
