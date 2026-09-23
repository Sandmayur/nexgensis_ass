import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getProducts } from "../services/products";
import { useProductOverrides } from "../context/ProductOverridesContext";

export function useProducts() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const { mergeProductsList } = useProductOverrides();

  // Parse URL state safely
  const initialQ = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialSortBy = searchParams.get("sortBy") || "";
  const initialOrder = searchParams.get("order") || "";
  
  // Safe pagination parse & clamp (at least 1)
  const initialPage = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const initialLimit = [10, 20, 50].includes(parseInt(searchParams.get("limit"))) 
    ? parseInt(searchParams.get("limit")) 
    : 10;

  // Local state for UI
  const [data, setData] = useState({ products: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [order, setOrder] = useState(initialOrder);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  // References for race condition safety
  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);

  // Helper to sync state to URL without reloading
  const updateUrl = useCallback((params) => {
    const newParams = new URLSearchParams();
    if (params.q) newParams.set("q", params.q);
    if (params.category && !params.q) newParams.set("category", params.category); // category disabled if searching
    if (params.sortBy) {
      newParams.set("sortBy", params.sortBy);
      newParams.set("order", params.order || "asc");
    }
    newParams.set("page", params.page.toString());
    newParams.set("limit", params.limit.toString());
    
    router.replace(`${pathname}?${newParams.toString()}`);
  }, [pathname, router]);

  const fetchProducts = useCallback(async (currentParams) => {
    setIsLoading(true);
    setError("");

    // 1. Cancel previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 2. Setup new AbortController and Request ID
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const currentRequestId = ++requestIdRef.current;

    try {
      const response = await getProducts(currentParams, abortController.signal);
      
      // 3. Race condition check: ignore stale response
      if (currentRequestId !== requestIdRef.current) return;
      
      // Handle pagination boundary clamp
      // If we ask for page 10 but total is only 50 (with limit 10, max page is 5)
      const calculatedMaxPage = Math.max(1, Math.ceil(response.total / currentParams.limit));
      if (currentParams.page > calculatedMaxPage && response.total > 0) {
         setPage(calculatedMaxPage);
         updateUrl({ ...currentParams, page: calculatedMaxPage });
         // we don't return here, we let the effect re-trigger with new page
         return;
      }

      // 4. Merge with local mock modifications
      const merged = mergeProductsList(response.products, currentParams);
      
      // Calculate new total considering local additions/deletions for this query
      // (This is an approximation, perfect mock pagination requires more complex logic)
      let adjustedTotal = response.total;
      if (currentParams.page === 1) {
         const localCount = merged.filter(p => p.isLocal).length;
         adjustedTotal += localCount;
      }
      
      setData({ products: merged, total: adjustedTotal });
      
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        // Ignored, aborted intentionally
      } else {
        if (currentRequestId === requestIdRef.current) {
          setError(err.message || "Failed to load products.");
        }
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [mergeProductsList, updateUrl]);

  return {
    data, isLoading, error,
    q, setQ,
    category, setCategory,
    sortBy, setSortBy,
    order, setOrder,
    page, setPage,
    limit, setLimit,
    fetchProducts,
    updateUrl
  };
}
