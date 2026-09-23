"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProductForm from "../../../components/ProductForm";
import { createProduct } from "../../../services/products";
import { useProductOverrides } from "../../../context/ProductOverridesContext";

export default function AddProductPage() {
  const router = useRouter();
  const { addOverride } = useProductOverrides();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      // Mock call to API (won't persist)
      await createProduct(formData);
      
      // Persist locally
      addOverride(formData);
      
      router.push("/products");
    } catch (error) {
      console.error("Failed to add product", error);
      alert("Failed to add product. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="mt-1 text-sm text-gray-500">Create a new product to list in your store.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-200 shadow-sm">
        <ProductForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
