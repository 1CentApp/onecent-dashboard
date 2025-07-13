'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  status: string;
}

const PendingProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingProducts();
    // eslint-disable-next-line
  }, []);

  const fetchPendingProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'pending');
    if (error) {
      toast.error('Failed to fetch products');
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('products')
      .update({ status })
      .eq('id', id);
    if (error) {
      toast.error('Failed to update product');
    } else {
      toast.success(`Product ${status}`);
      setProducts(products.filter((p: Product) => p.id !== id));
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Pending Products</h1>
      {products.length === 0 ? (
        <div>No pending products.</div>
      ) : (
        <div className="space-y-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-lg">{product.name}</div>
                <div className="text-gray-600 text-sm mb-2">{product.description}</div>
                <div className="text-xs text-gray-400">ID: {product.id}</div>
              </div>
              <div className="flex space-x-2 mt-4 md:mt-0">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  onClick={() => handleAction(product.id, 'approved')}
                >
                  Approve
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => handleAction(product.id, 'rejected')}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingProducts; 