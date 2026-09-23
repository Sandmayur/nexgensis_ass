import Link from "next/link";
import { Edit, Trash2, Eye, Star } from "lucide-react";

export default function ProductCard({ products, onDelete }) {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex p-4 gap-4">
            <div className="h-20 w-20 flex-shrink-0">
              <img className="h-full w-full rounded-md object-cover bg-gray-100 border border-gray-100" src={product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/80'} alt="" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate" title={product.title}>
                {product.title}
                {product.isLocal && <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">New</span>}
              </h3>
              <p className="mt-1 text-sm text-gray-500 capitalize">{product.category?.replace('-', ' ')}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">₹{Number(product.price).toFixed(2)}</span>
                <div className="flex items-center text-sm text-gray-700">
                  <Star className="w-4 h-4 text-yellow-400 mr-1 fill-yellow-400" />
                  {product.rating || 0}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
             <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  product.stock > 20 ? 'bg-green-100 text-green-800' :
                  product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {product.stock} left
            </span>
            <div className="flex gap-3">
              <Link href={`/products/${product.id}`} className="text-gray-500 hover:text-blue-600 p-1 bg-white rounded shadow-sm border border-gray-200">
                <Eye className="w-4 h-4" />
              </Link>
              <Link href={`/products/${product.id}/edit`} className="text-gray-500 hover:text-green-600 p-1 bg-white rounded shadow-sm border border-gray-200">
                <Edit className="w-4 h-4" />
              </Link>
              <button onClick={() => onDelete(product)} className="text-gray-500 hover:text-red-600 p-1 bg-white rounded shadow-sm border border-gray-200">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
