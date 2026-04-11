"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createColor, updateColor, deleteColor } from "@/src/shared/api/admin";
import toast from "react-hot-toast";
import { filterEnglishInput, filterArabicInput } from "@/src/shared/utils/input-validation";

type Color = {
  id: string;
  nameAr: string;
  nameEn: string;
  hexCode: string;
};

export default function ColorsClient({ initialColors }: { initialColors: Color[] }) {
  const [colors, setColors] = useState<Color[]>(initialColors);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ nameAr: "", nameEn: "", hexCode: "#000000" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr.trim() || !formData.nameEn.trim()) return toast.error("All fields are required");
    
    setLoading(true);
    try {
      const newColor = await createColor(formData);
      setColors([...colors, newColor]);
      setIsAdding(false);
      setFormData({ nameAr: "", nameEn: "", hexCode: "#000000" });
      toast.success("Color created successfully");
    } catch (error) {
      toast.error("Failed to create color");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.nameAr.trim() || !formData.nameEn.trim()) return toast.error("All fields are required");
    
    setLoading(true);
    try {
      const updatedColor = await updateColor(id, formData);
      setColors(colors.map(c => c.id === id ? updatedColor : c));
      setEditingId(null);
      setFormData({ nameAr: "", nameEn: "", hexCode: "#000000" });
      toast.success("Color updated successfully");
    } catch (error) {
      toast.error("Failed to update color");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this color?")) return;
    
    try {
      await deleteColor(id);
      setColors(colors.filter(c => c.id !== id));
      toast.success("Color deleted");
    } catch (error) {
      toast.error("Failed to delete color");
    }
  };

  const startEdit = (col: Color) => {
    setEditingId(col.id);
    setFormData({ nameAr: col.nameAr, nameEn: col.nameEn, hexCode: col.hexCode });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({ nameAr: "", nameEn: "", hexCode: "#000000" });
          }}
          disabled={isAdding}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Plus size={18} />
          Add Color
        </button>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/30 text-sm font-semibold text-muted-foreground">
          <div className="col-span-3">Color Preview</div>
          <div className="col-span-3">Hex / English Name</div>
          <div className="col-span-4 text-right">Arabic Name</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Add New Row */}
        <AnimatePresence>
          {isAdding && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreate}
              className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-primary/5 items-center"
            >
              <div className="col-span-3 flex items-center gap-3">
                <input 
                  type="color" 
                  value={formData.hexCode} 
                  onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
                  className="w-10 h-10 rounded border-none cursor-pointer p-0 bg-transparent"
                />
                <span className="font-mono bg-background px-2 py-1 rounded border border-border text-sm">{formData.hexCode}</span>
              </div>
              <div className="col-span-3">
                <input
                  type="text"
                  required
                  placeholder="English Name"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: filterEnglishInput(e.target.value) })}
                />
              </div>
              <div className="col-span-4">
                <input
                  type="text"
                  required
                  placeholder="Arabic Name"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-right dir-rtl"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: filterArabicInput(e.target.value) })}
                />
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <button type="submit" disabled={loading} className="p-2 text-green-600 hover:bg-green-600/10 rounded-md transition-colors">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="p-2 text-red-600 hover:bg-red-600/10 rounded-md transition-colors">
                  <X size={18} />
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Colors List */}
        <div className="divide-y divide-border">
          {colors.length === 0 && !isAdding && (
            <div className="p-8 text-center text-muted-foreground">
              No colors found. Add your first color above.
            </div>
          )}
          {colors.map((color) => (
            <div key={color.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/10 transition-colors">
              {editingId === color.id ? (
                <>
                  {/* Edit Mode */}
                  <div className="col-span-3 flex items-center gap-3">
                    <input 
                      type="color" 
                      value={formData.hexCode} 
                      onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
                      className="w-10 h-10 rounded border-none cursor-pointer p-0 bg-transparent"
                    />
                    <span className="font-mono bg-background px-2 py-1 rounded border border-border text-sm">{formData.hexCode}</span>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-background border border-border rounded-md"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: filterEnglishInput(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-right dir-rtl"
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: filterArabicInput(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button onClick={() => handleUpdate(color.id)} disabled={loading} className="p-2 text-green-600 hover:bg-green-600/10 rounded-md">
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-2 text-red-600 hover:bg-red-600/10 rounded-md">
                      <X size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* View Mode */}
                  <div className="col-span-3 flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-full shadow-sm border border-border/50" 
                      style={{ backgroundColor: color.hexCode }}
                      title={color.nameEn}
                    />
                    <span className="text-muted-foreground text-sm font-mono truncate">{color.hexCode}</span>
                  </div>
                  <div className="col-span-3 font-medium">{color.nameEn}</div>
                  <div className="col-span-4 text-right font-medium" dir="rtl">{color.nameAr}</div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button onClick={() => startEdit(color)} className="p-2 text-blue-600 hover:bg-blue-600/10 rounded-md transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(color.id)} className="p-2 text-red-600 hover:bg-red-600/10 rounded-md transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
