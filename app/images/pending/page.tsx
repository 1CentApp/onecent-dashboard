'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  status: string;
  submitted_by: string;
  created_at?: string;
}

interface Product {
  id: string;
  product_name: string;
  brand?: string;
  category?: string;
}

interface User {
  id: string;
  email: string;
  display_name?: string;
  location?: string;
  city?: string;
}

const PendingImages: React.FC = () => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingImages();
    // eslint-disable-next-line
  }, []);

  const fetchPendingImages = async () => {
    setLoading(true);
    try {
      console.log('Starting to fetch pending images...');
      
      // First, let's test if we can access the table at all
      const { data: testData, error: testError } = await supabase
        .from('product_images')
        .select('count')
        .limit(1);
      
      console.log('Test query result:', testData);
      console.log('Test query error:', testError);
      
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('status', 'pending');
        // Temporarily remove ordering by created_at until column exists
        // .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        toast.error(`Failed to fetch images: ${error.message}`);
        setLoading(false);
        return;
      }
      
      console.log('Fetched images:', data);
      setImages(data || []);
      
      // Fetch product info for all product_ids
      const productIds = (data || []).map((img: ProductImage) => img.product_id);
      console.log('Product IDs to fetch:', productIds);
      
      if (productIds.length > 0) {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('id, product_name, brand, category')
          .in('id', productIds);
        
        console.log('Product data:', productData);
        console.log('Product error:', productError);
        
        const productMap: Record<string, Product> = {};
        (productData || []).forEach((p: Product) => {
          productMap[p.id] = p;
        });
        
        // If some products are missing, try to fetch them individually
        const foundProductIds = Object.keys(productMap);
        const missingProductIds = productIds.filter(id => !foundProductIds.includes(id));
        if (missingProductIds.length > 0) {
          console.log('Missing products for IDs:', missingProductIds);
          
          // Try to fetch missing products one by one
          for (const missingId of missingProductIds) {
            const { data: singleProduct } = await supabase
              .from('products')
              .select('id, product_name, brand, category')
              .eq('id', missingId)
              .single();
            
            if (singleProduct) {
              productMap[singleProduct.id] = singleProduct;
              console.log('Found missing product:', singleProduct);
            }
          }
        }
        
        setProducts(productMap);
      }

      // Fetch user info for all submitted_by
      const userIds = Array.from(new Set((data || []).map((img: ProductImage) => img.submitted_by)));
      console.log('User IDs to fetch:', userIds);
      
      if (userIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('id, email, raw_user_meta_data')
          .in('id', userIds);
        
        console.log('User data:', userData);
        console.log('User error:', userError);
        
        const userMap: Record<string, User> = {};
        (userData || []).forEach((u: any) => {
          userMap[u.id] = {
            id: u.id,
            email: u.email,
            display_name: u.raw_user_meta_data?.display_name || u.raw_user_meta_data?.name || 'Unknown User',
            location: u.raw_user_meta_data?.location,
            city: u.raw_user_meta_data?.city
          };
        });
        setUsers(userMap);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred while fetching images');
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (err) {
      return 'Invalid date';
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Pending Product Images</h1>
      {images.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg">No pending images to review</div>
        </div>
      ) : (
        <div className="space-y-6">
          {images.map((img) => {
            const product = products[img.product_id];
            const user = users[img.submitted_by];
            
            return (
              <div key={img.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Image Section */}
                  <div className="flex-shrink-0">
                    <div className="relative group">
                      <img 
                        src={img.image_url} 
                        alt="Product" 
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 cursor-pointer transition-all duration-200 hover:scale-105"
                        onClick={() => setSelectedImage(img.image_url)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product and User Info */}
                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {product?.product_name || 'Unknown Product'}
                      </h3>
                      {product?.brand && (
                        <p className="text-gray-600 mb-1">Brand: {product.brand}</p>
                      )}
                      {product?.category && (
                        <p className="text-gray-600 mb-1">Category: {product.category}</p>
                      )}
                      <p className="text-sm text-gray-500">Product ID: {img.product_id}</p>
                      {/* Debug info */}
                      {!product && (
                        <p className="text-sm text-red-500 mt-1">
                          ⚠️ Product not found in database. This might be a data inconsistency.
                        </p>
                      )}
                    </div>

                    {/* Submitter Info */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">Submitted By:</h4>
                      {user ? (
                        <div className="text-sm">
                          <p><span className="font-medium">Name:</span> {user.display_name}</p>
                          <p><span className="font-medium">Email:</span> {user.email}</p>
                          {user.location && (
                            <p><span className="font-medium">Location:</span> {user.location}</p>
                          )}
                          {user.city && (
                            <p><span className="font-medium">City:</span> {user.city}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">User information not available</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted: {formatDate(img.created_at || null)}
                      </p>
                      <p className="text-xs text-blue-500 mt-1">
                        📸 Click image to zoom
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium"
                        onClick={() => handleAction(img.id, 'approved')}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium"
                        onClick={() => handleAction(img.id, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={selectedImage} 
              alt="Product" 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingImages; 