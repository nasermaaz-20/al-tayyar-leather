"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Search, ImageIcon } from "lucide-react";
import Link from "next/link";
import { deleteProduct } from "@/src/shared/api/admin";
import toast from "react-hot-toast";

type Product = {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  price: number | null;
  images: { url: string; alt: string; order: number }[];
  categories: { id: string; nameEn: string; nameAr: string }[];
  colors: { id: string; hexCode: string; nameEn: string; nameAr: string }[];
};

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.nameAr.toLowerCase().includes(search.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setIsDeleting(id);
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        <Link
          href="/admin/products/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/30 text-sm font-semibold text-muted-foreground">
          <div className="col-span-4">Product Details</div>
          <div className="col-span-3">Categories & Colors</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        <div className="divide-y divide-border">
          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No products found. Add your first product.
            </div>
          )}

          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-col md:grid md:grid-cols-12 gap-4 p-4 items-start md:items-center hover:bg-muted/10 transition-colors"
            >
              <div className="col-span-4 flex items-center gap-4 w-full">
                <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center border border-border/50 shrink-0 overflow-hidden relative">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].alt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground truncate">{product.nameEn}</h3>
                  <p className="text-sm text-muted-foreground truncate" dir="rtl">
                    {product.nameAr}
                  </p>
                  <p className="text-xs font-mono px-2 mx-1 inline-block py-0.5 bg-muted rounded text-muted-foreground mt-1">
                    {product.slug}
                  </p>
                </div>
              </div>

              <div className="col-span-3 text-sm flex flex-col gap-2 w-full">
                <div className="flex flex-wrap gap-1">
                  {product.categories.slice(0, 2).map((c) => (
                    <span key={c.id} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs border border-primary/20">
                      {c.nameEn}
                    </span>
                  ))}
                  {product.categories.length > 2 && (
                    <span className="text-xs text-muted-foreground">+{product.categories.length - 2}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {product.colors.map((c) => (
                    <div
                      key={c.id}
                      className="w-4 h-4 rounded-full shadow-sm border border-border/50"
                      style={{ backgroundColor: c.hexCode }}
                      title={c.nameEn}
                    />
                  ))}
                </div>
              </div>

              <div className="col-span-2 font-medium w-full">
                {product.price ? `$${product.price.toFixed(2)}` : <span className="text-muted-foreground text-sm italic">Not specified</span>}
              </div>

              <div className="col-span-3 flex items-center justify-end gap-2 w-full md:w-auto md:ml-auto mt-2 md:mt-0">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="p-2 text-blue-600 hover:bg-blue-600/10 rounded-md transition-colors"
                >
                  <Edit2 size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  disabled={isDeleting === product.id}
                  className="p-2 text-red-600 hover:bg-red-600/10 rounded-md transition-colors disabled:opacity-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
