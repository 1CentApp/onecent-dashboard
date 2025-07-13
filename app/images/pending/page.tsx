'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  status: string;
}

interface Product {
  id: string;
  name: string;
}

const PendingImages: React.FC = () => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingImages();
    // eslint-disable-next-line
  }, []);

  const fetchPendingImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('status', 'pending');
    if (error) {
      toast.error('Failed to fetch images');
      setLoading(false);
      return;
    }
    setImages(data || []);
    // Fetch product info for all product_ids
    const productIds = (data || []).map((img: ProductImage) => img.product_id);
    if (productIds.length > 0) {
      const { data: productData } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds);
      const productMap: Record<string, Product> = {};
      (productData || []).forEach((p: Product) => {
        productMap[p.id] = p;
      });
      setProducts(productMap);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('product_images')
      .update({ status })
      .eq('id', id);
    if (error) {
      toast.error('Failed to update image');
    } else {
      toast.success(`Image ${status}`);
      setImages(images.filter((img: ProductImage) => img.id !== id));
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Pending Product Images</h1>
      {images.length === 0 ? (
        <div>No pending images.</div>
      ) : (
        <div className="space-y-6">
          {images.map((img) => (
            <div key={img.id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4">
                <img src={img.image_url} alt="Product" className="w-24 h-24 object-cover rounded border" />
                <div>
                  <div className="font-semibold text-lg">{products[img.product_id]?.name || 'Unknown Product'}</div>
                  <div className="text-xs text-gray-400">Product ID: {img.product_id}</div>
                  <div className="text-xs text-gray-400">Image ID: {img.id}</div>
                </div>
              </div>
              <div className="flex space-x-2 mt-4 md:mt-0">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  onClick={() => handleAction(img.id, 'approved')}
                >
                  Approve
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => handleAction(img.id, 'rejected')}
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

export default PendingImages; 