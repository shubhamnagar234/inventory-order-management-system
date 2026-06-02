import type { Product, Customer, Order } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function fetchWithError(url: string, options?: RequestInit) {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `HTTP error! status: ${response.status}`,
    );
  }

  if (response.status === 204) return null;

  return response.json();
}

export const api = {
  // Products
  getProducts: (): Promise<Product[]> => fetchWithError("/products"),

  getProduct: (id: number): Promise<Product> =>
    fetchWithError(`/products/${id}`),

  createProduct: (data: Omit<Product, "id">): Promise<Product> =>
    fetchWithError("/products", { method: "POST", body: JSON.stringify(data) }),

  updateProduct: (id: number, data: Partial<Product>): Promise<Product> =>
    fetchWithError(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteProduct: (id: number): Promise<void> =>
    fetchWithError(`/products/${id}`, { method: "DELETE" }),

  // Customers
  getCustomers: (): Promise<Customer[]> => fetchWithError("/customers"),

  createCustomer: (data: Omit<Customer, "id">): Promise<Customer> =>
    fetchWithError("/customers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteCustomer: (id: number): Promise<void> =>
    fetchWithError(`/customers/${id}`, { method: "DELETE" }),

  // Orders
  getOrders: (): Promise<Order[]> => fetchWithError("/orders"),

  createOrder: (data: {
    customer_id: number;
    items: { product_id: number; quantity: number }[];
  }): Promise<Order> =>
    fetchWithError("/orders", { method: "POST", body: JSON.stringify(data) }),

  deleteOrder: (id: number): Promise<void> =>
    fetchWithError(`/orders/${id}`, { method: "DELETE" }),
};
