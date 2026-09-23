import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, X, AlertCircle } from "lucide-react";
import { getCategories } from "../services/categories";

export default function ProductForm({ initialData = {}, onSubmit, isSubmitting }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    price: initialData.price || "",
    stock: initialData.stock || "",
    category: initialData.category || "",
    brand: initialData.brand || ""
  });

  useEffect(() => {
    let mounted = true;
    getCategories()
      .then((data) => {
        if (mounted) setCategories(data);
      })
      .catch((err) => console.error("Failed to load categories", err));
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Basic validation
    if (!formData.title.trim()) return setError("Title is required.");
    if (!formData.category) return setError("Category is required.");
    if (Number(formData.price) <= 0) return setError("Price must be greater than 0.");
    if (Number(formData.stock) < 0 || !Number.isInteger(Number(formData.stock))) {
      return setError("Stock must be a positive integer.");
    }
    
    setError("");

    // Pass validated numeric values
    onSubmit({
      ...formData,
      price: Number(formData.price),
      stock: parseInt(formData.stock, 10),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
            Product Title <span className="text-red-500">*</span>
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 pl-3"
            />
          </div>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">
            Price ($) <span className="text-red-500">*</span>
          </label>
          <div className="mt-2">
            <input
              type="number"
              name="price"
              id="price"
              step="0.01"
              min="0.01"
              required
              value={formData.price}
              onChange={handleChange}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 pl-3"
            />
          </div>
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium leading-6 text-gray-900">
            Stock <span className="text-red-500">*</span>
          </label>
          <div className="mt-2">
            <input
              type="number"
              name="stock"
              id="stock"
              min="0"
              step="1"
              required
              value={formData.stock}
              onChange={handleChange}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 pl-3"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="mt-2">
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 pl-3 pr-8"
            >
              <option value="" disabled>Select a category</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="brand" className="block text-sm font-medium leading-6 text-gray-900">
            Brand
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="brand"
              id="brand"
              value={formData.brand}
              onChange={handleChange}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 pl-3"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
            Description
          </label>
          <div className="mt-2">
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 pl-3"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-4 border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
            isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 focus-visible:outline-blue-600"
          }`}
        >
          {isSubmitting ? (
            <>
               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
               Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Product
            </>
          )}
        </button>
      </div>
    </form>
  );
}
