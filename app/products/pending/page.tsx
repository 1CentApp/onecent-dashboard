'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

interface Product {
  [key: string]: any; // Allow all fields
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  status: string;
}

const PendingProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [imagesByProduct, setImagesByProduct] = useState<Record<string, ProductImage[]>>({});
  const [userInfoByProduct, setUserInfoByProduct] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingProducts();
    // eslint-disable-next-line
  }, []);

  const fetchPendingProducts = async () => {
    setLoading(true);
    // Fetch all pending products
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'pending');
    if (productsError) {
      toast.error('Failed to fetch products');
      setLoading(false);
      return;
    }
    setProducts(productsData || []);
    // Fetch all images for these products
    const productIds = (productsData || []).map((p: Product) => p.id);
    // Fetch user info for each product
    const userIds = Array.from(new Set((productsData || []).map((p: Product) => p.submitted_by).filter(Boolean)));
    let userInfoMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email, display_name, location')
        .in('id', userIds);
      (usersData || []).forEach((u: any) => {
        userInfoMap[u.id] = u;
      });
    }
    setUserInfoByProduct(userInfoMap);
    if (productIds.length > 0) {
      const { data: imagesData } = await supabase
        .from('product_images')
        .select('*')
        .in('product_id', productIds);
      // Group images by product_id
      const imagesMap: Record<string, ProductImage[]> = {};
      (imagesData || []).forEach((img: ProductImage) => {
        if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
        imagesMap[img.product_id].push(img);
      });
      setImagesByProduct(imagesMap);
    } else {
      setImagesByProduct({});
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
            <div key={product.id} className="bg-white rounded shadow p-4 flex flex-col space-y-4">
              {/* Images */}
              {imagesByProduct[product.id] && imagesByProduct[product.id].length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {imagesByProduct[product.id].map((img) => (
                    <img key={img.id} src={img.image_url} alt="Product" className="w-24 h-24 object-cover rounded border" />
                  ))}
                </div>
              )}
              {/* Submitter Info */}
              <div className="mb-2 p-2 bg-gray-50 rounded border border-gray-200">
                <div className="font-semibold text-gray-700 mb-1">Submitted By:</div>
                {userInfoByProduct[product.submitted_by] ? (
                  <>
                    <div><span className="font-semibold">Name:</span> {userInfoByProduct[product.submitted_by].display_name || 'N/A'}</div>
                    <div><span className="font-semibold">Email:</span> {userInfoByProduct[product.submitted_by].email || 'N/A'}</div>
                    <div><span className="font-semibold">Location:</span> {userInfoByProduct[product.submitted_by].location || 'N/A'}</div>
                  </>
                ) : (
                  <div className="text-gray-500">Unknown submitter</div>
                )}
              </div>
              {/* All product fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mb-2">
                {Object.entries(product).map(([key, value]) => (
                  <div key={key} className="text-sm text-gray-700">
                    <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </div>
                ))}
              </div>
              <div className="flex space-x-2 mt-2">
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