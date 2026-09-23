"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCcw } from "lucide-react";

import { useDebounce } from "../../hooks/useDebounce";
import { useProducts } from "../../hooks/useProducts";
import { useProductOverrides } from "../../context/ProductOverridesContext";

import SearchBar from "../../components/SearchBar";
import FilterBar from "../../components/FilterBar";
import ProductTable from "../../components/ProductTable";
import ProductCard from "../../components/ProductCard";
import Pagination from "../../components/Pagination";
import ConfirmModal from "../../components/ConfirmModal";
import { deleteProduct } from "../../services/products";

export default function ProductsPage() {
  const {
    data, isLoading, error,
    q, setQ,
    category, setCategory,
    sortBy, setSortBy,
    order, setOrder,
    page, setPage,
    limit, setLimit,
    fetchProducts, updateUrl
  } = useProducts();

  const { deleteOverride, resetOverrides } = useProductOverrides();
  const debouncedQ = useDebounce(q, 400);

  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync to URL & Fetch when params change
  useEffect(() => {
    const currentParams = { q: debouncedQ, category, sortBy, order, page, limit };
    
    // When searching, category is effectively disabled in logic
    if (debouncedQ && category) {
      currentParams.category = "";
      setCategory("");
    }
    
    updateUrl(currentParams);
    fetchProducts(currentParams);
  }, [debouncedQ, category, sortBy, order, page, limit, fetchProducts, updateUrl]);

  // Handlers
  const handleSearchChange = (val) => {
    setQ(val);
    setPage(1); // Reset page on search change
  };

  const handleCategoryChange = (val) => {
    setCategory(val);
    setQ(""); // Clear search on category change
    setPage(1);
  };

  const handleSortByChange = (val) => {
    setSortBy(val);
    if (val && !order) setOrder("asc");
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    
    try {
      if (!productToDelete.isLocal) {
        // Mock delete via API
        await deleteProduct(productToDelete.id);
      }
      // Apply local override
      deleteOverride(productToDelete.id);
      // Re-fetch to ensure list is accurate
      fetchProducts({ q: debouncedQ, category, sortBy, order, page, limit });
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Failed to delete product. Please try again.");
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store inventory.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => { resetOverrides(); fetchProducts({ q: debouncedQ, category, sortBy, order, page, limit }); }}
            className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Reset local changes"
          >
            <RefreshCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
          <Link
            href="/products/add"
            className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <div className="flex flex-col xl:flex-row gap-4 justify-between">
          <SearchBar value={q} onChange={handleSearchChange} isSearching={q !== debouncedQ} />
          <FilterBar
            category={category}
            onCategoryChange={handleCategoryChange}
            sortBy={sortBy}
            onSortByChange={handleSortByChange}
            order={order}
            onOrderChange={setOrder}
            searchActive={!!q}
          />
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-md border border-red-200 text-sm text-red-700">
            {error}
            <button onClick={() => fetchProducts({ q: debouncedQ, category, sortBy, order, page, limit })} className="ml-4 font-medium underline">Retry</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : data.products.length === 0 && !error ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <ProductTable products={data.products} onDelete={setProductToDelete} />
            <ProductCard products={data.products} onDelete={setProductToDelete} />
            
            <Pagination
              currentPage={page}
              totalItems={data.total}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
            />
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={!!productToDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setProductToDelete(null)}
        isConfirming={isDeleting}
      />
    </div>
  );
}
