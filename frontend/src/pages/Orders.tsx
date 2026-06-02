import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, X, Loader2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import type { Order, Customer, Product } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import { TableRowSkeleton } from '../components/Skeletons';
import { useToast } from '../components/ToastContext';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [orderItems, setOrderItems] = useState<{ product_id: number | ''; quantity: number | '' }[]>([
    { product_id: '', quantity: 1 }
  ]);
  
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const loadAllData = async () => {
    try {
      const [ordersData, customersData, productsData] = await Promise.all([
        api.getOrders(),
        api.getCustomers(),
        api.getProducts()
      ]);
      setOrders(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitial = async () => {
      await loadAllData();
    };
    fetchInitial();
  }, []);

  const addOrderItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  };

  const removeOrderItem = (index: number) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems.length ? newItems : [{ product_id: '', quantity: 1 }]);
  };

  const updateOrderItem = (index: number, field: 'product_id' | 'quantity', value: number | '') => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const calculateTotalPreview = () => {
    return orderItems.reduce((total, item) => {
      if (item.product_id && item.quantity) {
        const product = products.find(p => p.id === item.product_id);
        if (product) return total + (product.price * (item.quantity as number));
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError("Please select a customer.");
      return;
    }

    const validItems = orderItems.filter(item => item.product_id !== '' && item.quantity !== '');
    
    if (validItems.length === 0) {
      setError("Please add at least one valid product to the order.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createOrder({
        customer_id: selectedCustomerId as number,
        items: validItems.map(item => ({
          product_id: item.product_id as number,
          quantity: item.quantity as number
        }))
      });
      
      setSelectedCustomerId('');
      setOrderItems([{ product_id: '', quantity: 1 }]);
      
      loadAllData();
      setError('');
      toast('Order created successfully', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
  };

  const executeDelete = async () => {
    if (itemToDelete === null) return;
    try {
      await api.deleteOrder(itemToDelete);
      loadAllData();
      toast('Order deleted successfully', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
    } finally {
      setItemToDelete(null);
    }
  };

  const getCustomerName = (id: number) => {
    return customers.find(c => c.id === id)?.full_name || 'Unknown Customer';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
          <ShoppingCart size={24} />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Order Management</h1>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Order</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">-- Choose a customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <label className="block text-sm font-medium text-gray-700">Order Items</label>
              
              {orderItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <select
                      required
                      value={item.product_id}
                      onChange={(e) => updateOrderItem(index, 'product_id', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    >
                      <option value="">-- Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (${p.price}) - {p.quantity_in_stock} left
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      required
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, 'quantity', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                      placeholder="Qty"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOrderItem(index)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addOrderItem}
                className="text-sm text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700"
              >
                <Plus size={16} /> Add another item
              </button>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-gray-600 font-medium">Estimated Total:</span>
              <span className="text-xl font-bold text-gray-900">${calculateTotalPreview().toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 text-white font-medium py-2.5 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Place Order
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-fit max-h-[calc(100vh-8rem)]">
          <div className="overflow-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600 shadow-sm">
                  <th className="p-3 sm:p-4 font-medium">Order ID</th>
                  <th className="p-3 sm:p-4 font-medium">Customer</th>
                  <th className="p-3 sm:p-4 font-medium">Date</th>
                  <th className="p-3 sm:p-4 font-medium">Total Amount</th>
                  <th className="p-3 sm:p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <TableRowSkeleton columns={6} />
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">No orders found. Create your first order!</td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {orders.map((order, index) => (
                      <motion.tr 
                        key={order.id} 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3 sm:p-4 font-medium text-gray-900">#{order.id}</td>
                        <td className="p-3 sm:p-4 text-gray-900">{getCustomerName(order.customer_id)}</td>
                        <td className="p-3 sm:p-4 text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3 sm:p-4 text-gray-600">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </td>
                        <td className="p-3 sm:p-4 font-medium text-gray-900">
                          ${order.total_amount.toFixed(2)}
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setViewingOrder(order)}
                              className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={executeDelete}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
      />

      {viewingOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingCart size={20} className="text-emerald-600" />
                Order #{viewingOrder.id} Details
              </h3>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Customer</p>
                  <p className="font-medium text-gray-900">{getCustomerName(viewingOrder.customer_id)}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Date Placed</p>
                  <p className="font-medium text-gray-900">{new Date(viewingOrder.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
                    <tr>
                      <th className="p-3 font-medium">Product</th>
                      <th className="p-3 font-medium text-center">Qty</th>
                      <th className="p-3 font-medium text-right">Price</th>
                      <th className="p-3 font-medium text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {viewingOrder.items.map((item, idx) => {
                      const product = products.find(p => p.id === item.product_id);
                      const price = product?.price || 0;
                      const subtotal = price * item.quantity;
                      return (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="p-3 text-gray-900 font-medium">
                            {product?.name || `Unknown Product #${item.product_id}`}
                          </td>
                          <td className="p-3 text-gray-600 text-center">{item.quantity}</td>
                          <td className="p-3 text-gray-600 text-right">${price.toFixed(2)}</td>
                          <td className="p-3 text-gray-900 font-medium text-right">${subtotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-gray-600 font-medium">Total Amount:</span>
                <span className="text-2xl font-bold text-gray-900">${viewingOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setViewingOrder(null)}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}