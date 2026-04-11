"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Save, X, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createGalleryImage, deleteGalleryImage, reorderGalleryImages } from "@/src/shared/api/admin";
import toast from "react-hot-toast";
import { ImageUpload } from "@/src/features/admin/components/ImageUpload";

type Image = {
  id: string;
  url: string;
  alt: string;
  order: number;
};

export default function GalleryClient({ initialImages }: { initialImages: Image[] }) {
  const [images, setImages] = useState<Image[]>(initialImages);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reordering, setReordering] = useState(false);
  
  const [formData, setFormData] = useState({ url: "", alt: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url.trim()) return toast.error("Image URL is required");
    
    setLoading(true);
    try {
      const newImage = await createGalleryImage(formData);
      setImages([...images, newImage]);
      setIsAdding(false);
      setFormData({ url: "", alt: "" });
      toast.success("Image added to gallery");
    } catch (error) {
      toast.error("Failed to add image");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this image from the gallery?")) return;
    
    setLoading(true);
    try {
      await deleteGalleryImage(id);
      setImages(images.filter(img => img.id !== id));
      toast.success("Image removed");
    } catch (error) {
      toast.error("Failed to remove image");
    } finally {
      setLoading(false);
    }
  };

  const shiftLeft = async (index: number) => {
    if (index === 0 || reordering) return;
    setReordering(true);
    
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index - 1];
    newImages[index - 1] = temp;
    
    setImages(newImages);
    
    try {
      await reorderGalleryImages(newImages.map(img => img.id));
      toast.success("Order updated");
    } catch (error) {
      toast.error("Failed to reorder images");
      setImages(images); // Revert on failure
    } finally {
      setReordering(false);
    }
  };

  const shiftRight = async (index: number) => {
    if (index === images.length - 1 || reordering) return;
    setReordering(true);
    
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index + 1];
    newImages[index + 1] = temp;
    
    setImages(newImages);
    
    try {
      await reorderGalleryImages(newImages.map(img => img.id));
      toast.success("Order updated");
    } catch (error) {
      toast.error("Failed to reorder images");
      setImages(images); // Revert on failure
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="text-sm text-muted-foreground">
          Total images: <span className="font-semibold text-foreground">{images.length}</span>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setFormData({ url: "", alt: "" });
          }}
          disabled={isAdding}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Plus size={18} />
          Add Image
        </button>
      </div>

      {/* Add New Row */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleCreate}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 border border-primary/20 bg-primary/5 rounded-xl shadow-sm items-end"
          >
            <div className="md:col-span-5 space-y-2">
              <label className="text-sm font-medium text-foreground">Image *</label>
              <ImageUpload
                  value={formData.url}
                  onChange={(url) => setFormData({ ...formData, url })}
                  folder="gallery"
                />
            </div>
            <div className="md:col-span-5 space-y-2">
              <label className="text-sm font-medium text-foreground">Alt Text (Optional)</label>
              <input
                type="text"
                placeholder="Describe the image..."
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                value={formData.alt}
                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-end gap-2 pb-0.5">
              <button type="submit" disabled={loading} className="w-full justify-center p-2 flex items-center gap-2 text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors shadow-sm">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save</>}
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="p-2 text-red-600 hover:bg-red-600/10 border border-red-600/20 rounded-md transition-colors bg-background">
                <X size={18} />
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Gallery Grid */}
      {images.length === 0 && !isAdding ? (
        <div className="p-12 text-center border-2 border-dashed border-border rounded-xl text-muted-foreground bg-muted/10">
          No images in the gallery yet. Click &quot;Add Image&quot; to start.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence>
            {images.map((img, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={img.id}
                className="group relative bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow aspect-square flex flex-col"
              >
                <div className="relative flex-1 bg-muted">
                  <img
                    src={img.url}
                    alt={img.alt || "Gallery image"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Overlay Toolbar */}
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-bl from-black/60 to-transparent w-full flex justify-end">
                    <button
                      onClick={() => handleDelete(img.id)}
                      disabled={loading || reordering}
                      className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-3 border-t border-border flex items-center justify-between bg-muted/30">
                  <button
                    onClick={() => shiftLeft(idx)}
                    disabled={idx === 0 || reordering}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move earlier"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <span className="text-xs font-medium text-muted-foreground font-mono">
                    #{idx + 1}
                  </span>
                  <button
                    onClick={() => shiftRight(idx)}
                    disabled={idx === images.length - 1 || reordering}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move later"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
