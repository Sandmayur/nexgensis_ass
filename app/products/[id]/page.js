"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Package, Check, Tag } from "lucide-react";
import { getProductById } from "../../../services/products";
import { useProductOverrides } from "../../../context/ProductOverridesContext";
import ImageGallery from "../../../components/ImageGallery";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getMergedProduct } = useProductOverrides();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    async function load() {
      try {
        setIsLoading(true);
        setError(false);
        let apiProduct = null;
        
        try {
          apiProduct = await getProductById(id);
        } catch (e) {
          if (e.status === 404) {
             // Let it fall through, getMergedProduct will check if it's a pure local product
             apiProduct = null;
          } else {
             throw e;
          }
        }
        
        const merged = getMergedProduct(apiProduct, id);
        
        if (mounted) {
          if (!merged) {
             setError(true);
          } else {
             setProduct(merged);
          }
        }
      } catch (err) {
        if (mounted) setError(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    if (id) load();

    return () => {
      mounted = false;
    };
  }, [id, getMergedProduct]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20 px-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <p className="mt-2 text-gray-500">The product you are looking for doesn't exist or has been deleted.</p>
        <div className="mt-6">
          <Link href="/products" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-500 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <Link
          href={`/products/${product.id}/edit`}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Edit Product
        </Link>
      </div>
      
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          
          {/* Image Gallery */}
          <ImageGallery images={product.images} thumbnail={product.thumbnail} />

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.title}</h1>
            {product.isLocal && <span className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">Local Mock Addition</span>}
            
            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">${Number(product.price).toFixed(2)}</p>
            </div>

            {/* Rating */}
            <div className="mt-3">
              <h3 className="sr-only">Reviews</h3>
              <div className="flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <Star
                      key={rating}
                      className={`h-5 w-5 flex-shrink-0 ${
                        product.rating > rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="sr-only">{product.rating} out of 5 stars</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="space-y-6 text-base text-gray-700">
                <p>{product.description}</p>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <span className="capitalize">{product.category?.replace('-', ' ')}</span>
                </div>
                {product.brand && (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <span className="text-gray-400 border-l border-gray-300 pl-4">Brand:</span>
                    <span>{product.brand}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-5 h-5 text-gray-400" />
                <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
                {product.availabilityStatus && (
                  <span className="ml-2 text-gray-500">({product.availabilityStatus})</span>
                )}
              </div>
            </div>
            
            {/* Reviews Section */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="mt-10 border-t border-gray-200 pt-10">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Customer Reviews</h3>
                <div className="space-y-6">
                  {product.reviews.map((review, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">{review.reviewerName}</div>
                        <div className="flex text-yellow-400">
                           {[...Array(5)].map((_, i) => (
                             <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400' : 'text-gray-300'}`} />
                           ))}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                      <p className="mt-2 text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
