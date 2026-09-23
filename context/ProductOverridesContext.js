"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ProductOverridesContext = createContext(null);

export function ProductOverridesProvider({ children }) {
  const [addedProducts, setAddedProducts] = useState([]);
  const [editedProducts, setEditedProducts] = useState({});
  const [deletedProductIds, setDeletedProductIds] = useState(new Set());

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedAdded = localStorage.getItem("addedProducts");
      const storedEdited = localStorage.getItem("editedProducts");
      const storedDeleted = localStorage.getItem("deletedProductIds");

      if (storedAdded) setAddedProducts(JSON.parse(storedAdded));
      if (storedEdited) setEditedProducts(JSON.parse(storedEdited));
      if (storedDeleted) setDeletedProductIds(new Set(JSON.parse(storedDeleted)));
    } catch (e) {
      console.error("Failed to load local overrides", e);
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("addedProducts", JSON.stringify(addedProducts));
    localStorage.setItem("editedProducts", JSON.stringify(editedProducts));
    localStorage.setItem("deletedProductIds", JSON.stringify(Array.from(deletedProductIds)));
  }, [addedProducts, editedProducts, deletedProductIds]);

  const addOverride = useCallback((newProduct) => {
    // Generate a high ID for local products to avoid collision with DummyJSON
    const localProduct = { 
      ...newProduct, 
      id: Date.now(), 
      isLocal: true,
      meta: { createdAt: new Date().toISOString() } 
    };
    setAddedProducts((prev) => [localProduct, ...prev]);
    return localProduct;
  }, []);

  const editOverride = useCallback((id, updatedFields) => {
    // If it's a locally added product, update it in the addedProducts array
    const isLocalAdded = addedProducts.some((p) => p.id === id);
    if (isLocalAdded) {
      setAddedProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
      );
    } else {
      // Otherwise, record the override for the API product
      setEditedProducts((prev) => ({
        ...prev,
        [id]: { ...prev[id], ...updatedFields },
      }));
    }
  }, [addedProducts]);

  const deleteOverride = useCallback((id) => {
    const isLocalAdded = addedProducts.some((p) => p.id === id);
    if (isLocalAdded) {
      setAddedProducts((prev) => prev.filter((p) => p.id !== id));
    } else {
      setDeletedProductIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
  }, [addedProducts]);

  const resetOverrides = useCallback(() => {
    setAddedProducts([]);
    setEditedProducts({});
    setDeletedProductIds(new Set());
  }, []);

  // Merge logic: takes an array of API products and applies local mutations
  const mergeProductsList = useCallback((apiProducts, currentParams = {}) => {
    // 1. Filter out deleted products
    let merged = apiProducts.filter((p) => !deletedProductIds.has(p.id));

    // 2. Apply edits
    merged = merged.map((p) => (editedProducts[p.id] ? { ...p, ...editedProducts[p.id] } : p));

    // 3. Prepend added products (only on first page, and if they match filters)
    const { page = 1, q = "", category = "" } = currentParams;
    
    if (page === 1) {
      let applicableAdded = [...addedProducts];
      
      if (category) {
        applicableAdded = applicableAdded.filter((p) => p.category === category);
      }
      
      if (q) {
        const lowerQ = q.toLowerCase();
        applicableAdded = applicableAdded.filter(
          (p) =>
            p.title?.toLowerCase().includes(lowerQ) ||
            p.description?.toLowerCase().includes(lowerQ)
        );
      }
      
      merged = [...applicableAdded, ...merged];
    }

    return merged;
  }, [addedProducts, editedProducts, deletedProductIds]);

  const getMergedProduct = useCallback((apiProduct, id) => {
    if (!apiProduct) {
      // If API product wasn't found (e.g. 404), maybe it's purely local
      return addedProducts.find(p => p.id === Number(id)) || null;
    }
    if (deletedProductIds.has(apiProduct.id)) return null;
    return editedProducts[apiProduct.id] ? { ...apiProduct, ...editedProducts[apiProduct.id] } : apiProduct;
  }, [addedProducts, editedProducts, deletedProductIds]);

  return (
    <ProductOverridesContext.Provider
      value={{
        addedProducts,
        editedProducts,
        deletedProductIds,
        addOverride,
        editOverride,
        deleteOverride,
        resetOverrides,
        mergeProductsList,
        getMergedProduct
      }}
    >
      {children}
    </ProductOverridesContext.Provider>
  );
}

export function useProductOverrides() {
  const context = useContext(ProductOverridesContext);
  if (!context) {
    throw new Error("useProductOverrides must be used within a ProductOverridesProvider");
  }
  return context;
}
