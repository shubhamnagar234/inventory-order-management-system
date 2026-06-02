import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Loader2, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import type { Customer } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import { TableRowSkeleton } from '../components/Skeletons';
import { useToast } from '../components/ToastContext';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
    const fetchInitial = async () => {
      await loadCustomers();
    };
    fetchInitial();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createCustomer({
        full_name: fullName,
        email: email,
        phone_number: phone,
      });
      
      setFullName('');
      setEmail('');
      setPhone('');
      
      loadCustomers();
      setError('');
      toast('Customer created successfully', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create customer. Email must be unique.');
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
      await api.deleteCustomer(itemToDelete);
      loadCustomers();
      toast('Customer deleted successfully', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
    } finally {
      setItemToDelete(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
          <Users size={24} />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Customer Management</h1>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* ADD CUSTOMER FORM */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Customer</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="e.g. Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="(555) 123-4567"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Save Customer
                </>
              )}
            </button>
          </form>
        </div>

        {/* CUSTOMERS TABLE */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-fit max-h-[calc(100vh-8rem)]">
          <div className="overflow-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600 shadow-sm">
                  <th className="p-3 sm:p-4 font-medium">Name</th>
                  <th className="p-3 sm:p-4 font-medium">Email</th>
                  <th className="p-3 sm:p-4 font-medium">Phone</th>
                  <th className="p-3 sm:p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <TableRowSkeleton columns={4} />
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">No customers found. Add your first customer!</td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {customers.map((customer, index) => (
                      <motion.tr 
                        key={customer.id} 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3 sm:p-4 font-medium text-gray-900">{customer.full_name}</td>
                        <td className="p-3 sm:p-4 text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-gray-400" />
                            {customer.email}
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            {customer.phone_number}
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Customer"
                          >
                            <Trash2 size={18} />
                          </button>
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
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
      />
    </div>
  );
}