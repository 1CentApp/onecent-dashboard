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

interface User {
  id: string;
  email: string;
  display_name?: string;
  location?: string;
}

const PendingProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [imagesByProduct, setImagesByProduct] = useState<Record<string, ProductImage[]>>({});
  const [userInfoByProduct, setUserInfoByProduct] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingProducts();
    // eslint-disable-next-line
  }, []);

  const fetchPendingProducts = async () => {
    setLoading(true);
    try {
      // Fetch all pending products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'pending');
      
      if (productsError) {
        console.error('Products error:', productsError);
        toast.error('Failed to fetch products');
        setLoading(false);
        return;
      }

      console.log('Products data:', productsData);
      setProducts(productsData || []);

      // Fetch user info for each product
      const userIds = Array.from(new Set((productsData || []).map((p: Product) => p.submitted_by).filter(Boolean)));
      console.log('User IDs to fetch:', userIds);
      
      let userInfoMap: Record<string, User> = {};
      
      if (userIds.length > 0) {
        // Try to fetch from auth.users first (Supabase auth table)
        const { data: authUsersData, error: authUsersError } = await supabase
          .from('auth.users')
          .select('id, email, raw_user_meta_data')
          .in('id', userIds);
        
        console.log('Auth users data:', authUsersData);
        console.log('Auth users error:', authUsersError);
        
        if (!authUsersError && authUsersData) {
          authUsersData.forEach((u: any) => {
            userInfoMap[u.id] = {
              id: u.id,
              email: u.email,
              display_name: u.raw_user_meta_data?.display_name || u.raw_user_meta_data?.name || 'N/A',
              location: u.raw_user_meta_data?.location || 'N/A'
            };
          });
        }
        
        // Also try to fetch from the users table (if it exists)
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, display_name, location')
          .in('id', userIds);
        
        console.log('Users table data:', usersData);
        console.log('Users table error:', usersError);
        
        if (!usersError && usersData) {
          usersData.forEach((u: User) => {
            // Override with users table data if available
            userInfoMap[u.id] = {
              ...userInfoMap[u.id],
              ...u
            };
          });
        }
      }
      
      console.log('Final user info map:', userInfoMap);
      setUserInfoByProduct(userInfoMap);

      // Fetch all images for these products
      const productIds = (productsData || []).map((p: Product) => p.id);
      
      if (productIds.length > 0) {
        const { data: imagesData, error: imagesError } = await supabase
          .from('product_images')
          .select('*')
          .in('product_id', productIds);
        
        if (imagesError) {
          console.error('Images error:', imagesError);
        } else {
          // Group images by product_id
          const imagesMap: Record<string, ProductImage[]> = {};
          (imagesData || []).forEach((img: ProductImage) => {
            if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
            imagesMap[img.product_id].push(img);
          });
          setImagesByProduct(imagesMap);
        }
      } else {
        setImagesByProduct({});
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch data');
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

  const getProductImages = (product: Product) => {
    const images: string[] = [];
    
    // Add images from product_images table
    if (imagesByProduct[product.id]) {
      images.push(...imagesByProduct[product.id].map(img => img.image_url));
    }
    
    // Add image_url if it exists
    if (product.image_url) {
      images.push(product.image_url);
    }
    
    // Add image_urls if it exists
    if (Array.isArray(product.image_urls)) {
      images.push(...product.image_urls);
    }
    
    return images;
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Pending Products</h1>
      {products.length === 0 ? (
        <div>No pending products.</div>
      ) : (
        <div className="space-y-6">
          {products.map((product) => {
            const productImages = getProductImages(product);
            const user = userInfoByProduct[product.submitted_by];
            
            return (
              <div key={product.id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col space-y-4">
                {/* Product Images Section */}
                {productImages.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Product Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {productImages.map((imageUrl, idx) => (
                        <div key={idx} className="relative group">
                          <img 
                            src={imageUrl} 
                            alt="Product" 
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 cursor-pointer transition-all duration-200 hover:scale-105"
                            onClick={() => setSelectedImage(imageUrl)}
                            onError={(e) => {
                              console.error('Image failed to load:', imageUrl);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Submitter Info */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="font-semibold text-gray-700 mb-2">Submitted By:</div>
                  {user ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div><span className="font-semibold">Name:</span> {user.display_name || 'N/A'}</div>
                      <div><span className="font-semibold">Email:</span> {user.email || 'N/A'}</div>
                      <div><span className="font-semibold">Location:</span> {user.location || 'N/A'}</div>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <div>Unknown submitter</div>
                      <div className="text-xs text-gray-400 mt-1">User ID: {product.submitted_by || 'No user ID'}</div>
                      <div className="text-xs text-gray-400">This user may not exist in the database or may have been deleted.</div>
                    </div>
                  )}
                </div>
                
                {/* Product Details */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Product Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    {Object.entries(product).filter(([key]) => !['id', 'submitted_by', 'status'].includes(key)).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-semibold capitalize text-gray-700">{key.replace(/_/g, ' ')}:</span> 
                        <span className="ml-2 text-gray-600">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value || 'N/A')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium"
                    onClick={() => handleAction(product.id, 'approved')}
                  >
                    Approve Product
                  </button>
                  <button
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium"
                    onClick={() => handleAction(product.id, 'rejected')}
                  >
                    Reject Product
                  </button>
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
              className="absolute top-4 right-4 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingProducts; 