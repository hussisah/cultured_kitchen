import { Product } from './product.model';

export interface Order {
  id: number;
  customerName: string;
  items: Product[];
  total: number;
  status: string;
}