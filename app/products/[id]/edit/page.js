"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link"
import ProductForm from "../../../../components/ProductForm";
import { getProductById, updateProduct } from "../../../../services/products";
import { useProductOverrides } from "../../../../context/ProductOverridesContext";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getMergedProduct, editOverride } = useProductOverrides();

  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        let apiProduct = null;
        try {
          apiProduct = await getProductById(id);
        } catch (e) {
          if (e.status !== 404) throw e;
        }

        const merged = getMergedProduct(apiProduct, id);
        
        if (mounted) {
          if (!merged) setError(true);
          else setInitialData(merged);
        }
      } catch (err) {
        if (mounted) setError(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    if (id) load();
    return () => { mounted = false; };
  }, [id, getMergedProduct]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (!initialData.isLocal) {
        // Mock API call
        await updateProduct(id, formData);
      }
      
      // Update local state
      editOverride(Number(id), formData);
      
      router.push(`/products/${id}`);
    } catch (err) {
      console.error("Failed to update product", err);
      alert("Failed to update product. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="text-center py-20 px-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <p className="mt-2 text-gray-500">Cannot edit a non-existent product.</p>
        <Link href="/products" className="mt-6 inline-block text-blue-600 hover:underline">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href={`/products/${id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Product
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product: {initialData.title}</h1>
        <p className="mt-1 text-sm text-gray-500">Update product information.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-200 shadow-sm">
        <ProductForm initialData={initialData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
