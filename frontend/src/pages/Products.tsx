import { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Loader2, Pencil, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import type { Product } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import { TableRowSkeleton } from '../components/Skeletons';
import { useToast } from '../components/ToastContext';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  // Edit Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // 1. Define the function FIRST
  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitial = async () => {
      await loadProducts();
    };
    fetchInitial();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createProduct({
        name,
        sku,
        price: parseFloat(price),
        quantity_in_stock: parseInt(quantity, 10),
      });
      toast('Product created successfully', 'success');
      
      setName('');
      setSku('');
      setPrice('');
      setQuantity('');
      
      loadProducts();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    setIsUpdating(true);
    try {
      await api.updateProduct(editingProduct.id, {
        name: editName,
        sku: editSku,
        price: parseFloat(editPrice),
        quantity_in_stock: parseInt(editQuantity, 10),
      });
      toast('Product updated successfully', 'success');
      
      handleCancelEdit();
      loadProducts();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditSku(product.sku);
    setEditPrice(product.price.toString());
    setEditQuantity(product.quantity_in_stock.toString());
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditName('');
    setEditSku('');
    setEditPrice('');
    setEditQuantity('');
    setError('');
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
  };

  const executeDelete = async () => {
    if (itemToDelete === null) return;
    try {
      await api.deleteProduct(itemToDelete);
      loadProducts();
      toast('Product deleted successfully', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setItemToDelete(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
          <Package size={24} />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Product Management</h1>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* ADD PRODUCT FORM */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Add New Product
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. Wireless Mouse"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Must be unique)</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. WM-001"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="0"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Save Product
                </>
              )}
            </button>
          </form>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-fit max-h-[calc(100vh-8rem)]">
          <div className="overflow-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600 shadow-sm">
                  <th className="p-3 sm:p-4 font-medium">Product</th>
                  <th className="p-3 sm:p-4 font-medium">SKU</th>
                  <th className="p-3 sm:p-4 font-medium">Price</th>
                  <th className="p-3 sm:p-4 font-medium">Stock</th>
                  <th className="p-3 sm:p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <TableRowSkeleton columns={5} />
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No products found. Add your first item!</td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {products.map((product, index) => (
                      <motion.tr 
                        key={product.id} 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3 sm:p-4 font-medium text-gray-900">{product.name}</td>
                        <td className="p-3 sm:p-4 text-gray-600">
                          <span className="px-2.5 py-1 bg-gray-100 text-xs rounded-md font-mono">
                            {product.sku}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-gray-900">₹{product.price.toFixed(2)}</td>
                        <td className="p-3 sm:p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            product.quantity_in_stock <= 5 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {product.quantity_in_stock} in stock
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Edit Product"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete Product"
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
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />

      {/* EDIT PRODUCT DIALOG */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Pencil size={20} className="text-blue-600" />
                Edit Product
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  required
                  value={editSku}
                  onChange={(e) => setEditSku(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-100 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}