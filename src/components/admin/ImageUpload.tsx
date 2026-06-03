import React, { useState } from "react";
import { Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value?: { url: string; id: string } | null;
  onChange: (image: { url: string; id: string } | null) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className = "" }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [sessionUploadedId, setSessionUploadedId] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await res.json();
      if (data.success && data.image) {
        setSessionUploadedId(data.image.id);
        onChange({ url: data.image.url, id: data.image.id });
        toast.success("Image uploaded successfully");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleRemove = () => {
    if (value && value.id === sessionUploadedId) {
      // Delete orphaned file from server
      fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value.url }),
      }).catch((err) => console.error("Failed to cleanup image", err));
    }
    onChange(null);
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {value?.url ? (
        <div className="relative inline-block border rounded-md p-1 bg-muted/20 w-max">
          <img
            src={value.url}
            alt="Uploaded image"
            className="h-32 w-24 object-cover rounded shadow-sm"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-muted/5 hover:bg-muted/10 transition-colors">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
              <span className="text-sm text-muted-foreground">Uploading...</span>
            </div>
          ) : (
            <>
              <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Click or drag image to upload</p>
              <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WEBP (max 5MB)</p>
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleUpload}
                disabled={loading}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
