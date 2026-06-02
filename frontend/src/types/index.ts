export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity_in_stock: number;
}

export interface Customer {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
}

export interface Order {
  id: number;
  customer_id: number;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
}