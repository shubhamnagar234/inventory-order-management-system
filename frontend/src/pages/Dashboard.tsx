import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertCircle, Users, ShoppingCart, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import type { Product, Customer, Order } from '../types';
import { DashboardSkeleton } from '../components/Skeletons';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [productsData, customersData, ordersData] = await Promise.all([
          api.getProducts(),
          api.getCustomers(),
          api.getOrders()
        ]);
        
        setProducts(productsData);
        setCustomers(customersData);
        setOrders(ordersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
        {error}
      </div>
    );
  }

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.quantity_in_stock <= 5);
  
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getCustomerName = (id: number) => {
    return customers.find(c => c.id === id)?.full_name || 'Unknown';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">Welcome back. Here is what is happening with your inventory today.</p>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalProducts}</h3>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{orders.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Customers</p>
            <h3 className="text-2xl font-bold text-gray-900">{customers.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
            <h3 className="text-2xl font-bold text-gray-900">{lowStockProducts.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* LOW STOCK ALERTS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Package size={20} className="text-gray-400" />
              Inventory Alerts
            </h2>
            <Link to="/products" className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="p-4 sm:p-6 flex-1">
            {lowStockProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                All products are sufficiently stocked.
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500 font-mono">SKU: {product.sku}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                      Only {product.quantity_in_stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RECENT ORDERS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ShoppingCart size={20} className="text-gray-400" />
              Recent Orders
            </h2>
            <Link to="/orders" className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="p-4 sm:p-6 flex-1">
            {recentOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                No recent orders found.
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-gray-900">{getCustomerName(order.customer_id)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-bold text-gray-900">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}