"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/src/shared/api/admin";
import toast from "react-hot-toast";
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/src/shared/utils/cn";
import { ImageUpload } from '@/src/features/admin/components/ImageUpload';
import { filterEnglishInput, filterArabicInput } from "@/src/shared/utils/input-validation";

type Category = { id: string; nameEn: string; nameAr: string };
type Color = { id: string; nameEn: string; nameAr: string; hexCode: string };
type ImageInput = { url: string; alt: string; order: number; _id: string };

interface ProductFormProps {
  initialData?: any;
  categories: Category[];
  colors: Color[];
}

export function ProductForm({ initialData, categories, colors }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nameAr: initialData?.nameAr || "",
    nameEn: initialData?.nameEn || "",
    descAr: initialData?.descAr || "",
    descEn: initialData?.descEn || "",
    price: initialData?.price || "",
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.categories?.map((c: any) => c.id) || []
  );

  const [selectedColors, setSelectedColors] = useState<string[]>(
    initialData?.colors?.map((c: any) => c.id) || []
  );

  const [images, setImages] = useState<ImageInput[]>(
    initialData?.images?.map((img: any) => ({
      ...img,
      _id: Math.random().toString(36).substring(7),
    })) || []
  );

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleColor = (id: string) => {
    setSelectedColors((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const addImageField = () => {
    setImages([
      ...images,
      { url: "", alt: "", order: images.length, _id: Math.random().toString(36).substring(7) },
    ]);
  };

  const updateImage = (index: number, field: keyof ImageInput, value: string | number) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages.map((img, i) => ({ ...img, order: i }))); // re-sync orders
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr.trim() || !formData.nameEn.trim()) {
      return toast.error("Product names are required in both languages");
    }
    if (selectedCategories.length === 0) {
      return toast.error("Select at least one category");
    }

    setLoading(true);
    const payload = {
      ...formData,
      price: formData.price ? Number(formData.price) : null,
      categoryIds: selectedCategories,
      colorIds: selectedColors,
      images: images.map(({ _id, ...img }) => ({ ...img, alt: img.alt.trim() || formData.nameEn || "Product Image" })).filter((i) => i.url.trim()), // keep valid images
    };

    try {
      if (initialData?.id) {
        await updateProduct(initialData.id, payload);
        toast.success("Product updated successfully");
      } else {
        await createProduct(payload);
        toast.success("Product created successfully");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      console.error("Product submission error details:", error);
      if (error.details) {
        toast.error("Validation error: " + Object.values(error.details).join(", "));
      } else {
        toast.error(error.message || (initialData?.id ? "Failed to update product" : "Failed to create product"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {initialData ? "Edit Product" : "New Product"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Fill in the product details to add it to your catalog.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted font-medium transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {initialData ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* General Information */}
          <div className="p-6 bg-card border border-border shadow-sm rounded-xl space-y-6">
            <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">General Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">English Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classic Pure Leather"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: filterEnglishInput(e.target.value) })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block text-right">Arabic Name *</label>
                <input
                  type="text"
                  required
                  dir="rtl"
                  placeholder="جلد نقي كلاسيكي"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: filterArabicInput(e.target.value) })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-right"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Price ($) - Optional</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full md:w-1/2 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="p-6 bg-card border border-border shadow-sm rounded-xl space-y-6 text-foreground">
            <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">Descriptions</h2>
            <div className="space-y-4">
              <label className="text-sm font-medium">English Description</label>
              <textarea
                rows={4}
                value={formData.descEn}
                onChange={(e) => setFormData({ ...formData, descEn: filterEnglishInput(e.target.value) })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground resize-none"
                placeholder="Describe your product for the English market..."
              />
            </div>
            <div className="space-y-4">
              <label className="text-sm font-medium block text-right">Arabic Description</label>
              <textarea
                rows={4}
                dir="rtl"
                value={formData.descAr}
                onChange={(e) => setFormData({ ...formData, descAr: filterArabicInput(e.target.value) })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-right resize-none"
                placeholder="تفاصيل المنتج للسوق العربي..."
              />
            </div>
          </div>

          {/* Images */}
          <div className="p-6 bg-card border border-border shadow-sm rounded-xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-2 mb-4">
              <h2 className="text-xl font-semibold">Images</h2>
              <button
                type="button"
                onClick={addImageField}
                className="text-sm text-primary flex items-center gap-1 hover:underline"
              >
                <Plus size={16} /> Add Image
              </button>
            </div>

            {images.length === 0 && (
              <div className="p-6 text-center border-2 border-dashed border-border rounded-lg text-muted-foreground flex flex-col items-center justify-center">
                <p>No images added yet.</p>
                <button type="button" onClick={addImageField} className="text-primary mt-2">
                    Click to add an image                </button>
              </div>
            )}            <div className="space-y-4">
              {images.map((img, idx) => (
                <div key={img._id} className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-muted/20 border border-border rounded-lg">
                  <div className="w-full sm:w-1/2 space-y-1">
                      <label className="text-xs text-muted-foreground">Image</label>
                      <ImageUpload
                        value={img.url}
                        onChange={(url) => updateImage(idx, "url", url)}
                        folder="products"
                    />
                  </div>
                  <div className="w-full sm:w-1/3 space-y-1">
                    <label className="text-xs text-muted-foreground">Alt Text</label>
                    <input
                      type="text"
                      placeholder="Alt text"
                      value={img.alt}
                      onChange={(e) => updateImage(idx, "alt", e.target.value)}
                      className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="mt-4 sm:mt-6 p-2 text-red-500 hover:bg-red-500/10 rounded-md shrink-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Relations */}
        <div className="space-y-6 flex flex-col">
          {/* Categories Box */}
          <div className="p-6 bg-card border border-border shadow-sm rounded-xl space-y-4">
            <h2 className="text-xl font-semibold border-b border-border pb-2">Categories *</h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No categories found.</p>
              ) : (
                categories.map((c) => (
                  <label key={c.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-border">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-primary focus:ring-primary/50"
                      checked={selectedCategories.includes(c.id)}
                      onChange={() => toggleCategory(c.id)}
                    />
                    <span className="text-sm font-medium">{c.nameEn} <span className="text-muted-foreground">({c.nameAr})</span></span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Colors Box */}
          <div className="p-6 bg-card border border-border shadow-sm rounded-xl space-y-4">
            <h2 className="text-xl font-semibold border-b border-border pb-2">Available Colors</h2>
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
              {colors.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-2">No colors found.</p>
              ) : (
                colors.map((c) => (
                  <label
                    key={c.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border",
                      selectedColors.includes(c.id) ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedColors.includes(c.id)}
                      onChange={() => toggleColor(c.id)}
                    />
                    <div
                      className="w-5 h-5 rounded-full border border-border/50 shrink-0"
                      style={{ backgroundColor: c.hexCode }}
                    />
                    <span className="text-xs font-medium truncate">{c.nameEn}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

