"use client";

import React, { useRef, useState } from "react";
import { Upload, Play, Image as ImageIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MultiSelect, Option } from "./MultiSelect";

// --- Form Data Types ---
export interface AdFormData {
  title: string;
  category: string;
  format: string;
  uri: string;
  duration: number;
  minAge: number | string;
  maxAge: number | string;
  targetCountries: string[];
  targetGenders: string[];
  targetDevices: string[];
  targetCategories: string[];
  budget: number | string;
  isSkippable: boolean;
  skipOffset: number;
  isActive: boolean;
}

export const initialFormState: AdFormData = {
  title: "",
  category: "PRE_ROLL",
  format: "video",
  uri: "",
  duration: 0,
  minAge: "",
  maxAge: "",
  targetCountries: [],
  targetGenders: [],
  targetDevices: ["desktop", "mobile", "tablet"],
  targetCategories: [],
  budget: "",
  isSkippable: true,
  skipOffset: 5,
  isActive: true,
};

// --- Predefined Options ---
const COUNTRY_OPTIONS: Option[] = [
  { label: "United States (US)", value: "US" },
  { label: "United Kingdom (UK)", value: "GB" },
  { label: "Canada (CA)", value: "CA" },
  { label: "Australia (AU)", value: "AU" },
  { label: "Germany (DE)", value: "DE" },
  { label: "France (FR)", value: "FR" },
  { label: "India (IN)", value: "IN" },
  { label: "Japan (JP)", value: "JP" },
  { label: "Brazil (BR)", value: "BR" },
];

const CATEGORY_OPTIONS: Option[] = [
  { label: "Action", value: "action" },
  { label: "Comedy", value: "comedy" },
  { label: "Sports", value: "sports" },
  { label: "Gaming", value: "gaming" },
  { label: "News", value: "news" },
  { label: "Music", value: "music" },
];

// --- Sub-Components ---

export function CreativeTab({ formData, setFormData }: { formData: AdFormData, setFormData: any }) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    
    try {
      // Auto-detect duration for videos natively before upload
      if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          setFormData((f: any) => ({ ...f, duration: Math.ceil(video.duration) }));
        };
        video.src = URL.createObjectURL(file);
      }

      if (file.type.startsWith('image/')) {
         const fileData = new FormData();
         fileData.append('file', file);
         const res = await fetch('/api/upload', { method: 'POST', body: fileData });
         const data = await res.json();
         if (data.success) {
            setFormData((f: any) => ({ ...f, uri: data.image.url, format: 'image' }));
            toast.success('Image uploaded to MinIO!');
         } else throw new Error(data.error);
      } else if (file.type.startsWith('video/')) {
         const res = await fetch('/api/upload/presigned-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: file.name, contentType: file.type })
         });
         const data = await res.json();
         if (data.success) {
            await fetch(data.presignedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
            setFormData((f: any) => ({ ...f, uri: data.fileUrl, format: 'video' }));
            toast.success('Video uploaded to MinIO!');
         } else throw new Error(data.error);
      } else {
        toast.error("Unsupported file type");
      }
    } catch(err: any) {
       toast.error(err.message || 'Upload failed');
    } finally {
       setUploading(false);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Campaign Title</Label>
        <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Summer Sale 2026" />
      </div>
      
      <div className="space-y-2">
        <Label>Upload Media (Auto-fills Format & Duration)</Label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
          <Input type="file" accept="video/mp4,image/jpeg,image/png,image/webp" className="hidden" id="media-upload" onChange={handleFileUpload} />
          <Label htmlFor="media-upload" className="cursor-pointer flex flex-col items-center">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            )}
            <span className="font-medium">{uploading ? "Uploading to MinIO..." : "Click to upload Video or Image"}</span>
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Media URI</Label>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center p-2 bg-muted rounded">
            {formData.format === 'video' ? <Play className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
          </div>
          <Input required value={formData.uri} onChange={e => setFormData({...formData, uri: e.target.value})} placeholder="https://..." />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="space-y-2 flex-1">
          <Label>Ad Duration (Seconds)</Label>
          <Input type="number" min="0" value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} />
        </div>
        <div className="space-y-2 flex-1">
          <Label>Format</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}>
            <option value="video">Video</option>
            <option value="image">Image</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export function TargetingTab({ formData, setFormData }: { formData: AdFormData, setFormData: any }) {
  const handleToggleArray = (field: 'targetGenders', value: string) => {
    setFormData((prev: any) => {
      const list = prev[field];
      if (list.includes(value)) return { ...prev, [field]: list.filter((item: string) => item !== value) };
      return { ...prev, [field]: [...list, value] };
    });
  };

  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Minimum Age</Label>
          <Input type="number" min="13" value={formData.minAge} onChange={e => setFormData({...formData, minAge: e.target.value})} placeholder="18" />
        </div>
        <div className="space-y-2">
          <Label>Maximum Age</Label>
          <Input type="number" min="13" value={formData.maxAge} onChange={e => setFormData({...formData, maxAge: e.target.value})} placeholder="65" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Target Countries</Label>
        <MultiSelect
          options={COUNTRY_OPTIONS}
          selected={formData.targetCountries}
          onChange={(val) => setFormData({ ...formData, targetCountries: val })}
          placeholder="Select countries (leave empty for Global)"
        />
      </div>

      <div className="space-y-2">
        <Label>Target Content Categories</Label>
        <MultiSelect
          options={CATEGORY_OPTIONS}
          selected={formData.targetCategories}
          onChange={(val) => setFormData({ ...formData, targetCategories: val })}
          placeholder="Select categories (leave empty for all content)"
        />
      </div>

      <div className="space-y-2">
        <Label>Target Genders</Label>
        <div className="flex gap-4 pt-2">
          {['Male', 'Female', 'Other'].map(g => (
            <label key={g} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={formData.targetGenders.includes(g)} onChange={() => handleToggleArray('targetGenders', g)} />
              {g}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PlacementTab({ formData, setFormData }: { formData: AdFormData, setFormData: any }) {
  const handleToggleArray = (field: 'targetDevices', value: string) => {
    setFormData((prev: any) => {
      const list = prev[field];
      if (list.includes(value)) return { ...prev, [field]: list.filter((item: string) => item !== value) };
      return { ...prev, [field]: [...list, value] };
    });
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <Label>Ad Category (Position)</Label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
          <option value="PRE_ROLL">Pre-Roll (Before video starts)</option>
          <option value="MID_ROLL">Mid-Roll (During video playback)</option>
          <option value="POST_ROLL">Post-Roll (After video ends)</option>
          <option value="ANY">Any Placement (Auto-Optimize)</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Target Devices</Label>
        <div className="flex gap-4 pt-2">
          {['desktop', 'mobile', 'tablet'].map(d => (
            <label key={d} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
              <input type="checkbox" checked={formData.targetDevices.includes(d)} onChange={() => handleToggleArray('targetDevices', d)} />
              {d}
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          <Switch checked={formData.isSkippable} onCheckedChange={c => setFormData({...formData, isSkippable: c})} />
          <div className="space-y-0.5">
            <Label>Allow Skipping</Label>
            <p className="text-xs text-muted-foreground">User can skip this ad.</p>
          </div>
        </div>
        
        {formData.isSkippable && (
          <div className="space-y-2 w-1/3">
            <Label>Skip Offset (s)</Label>
            <Input type="number" min="0" value={formData.skipOffset} onChange={e => setFormData({...formData, skipOffset: Number(e.target.value)})} />
          </div>
        )}
      </div>
    </div>
  );
}

export function FinancialsTab({ formData, setFormData }: { formData: AdFormData, setFormData: any }) {
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <Label>Total Lifetime Budget ($)</Label>
        <Input type="number" min="0" step="0.01" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} placeholder="e.g. 500.00" />
        <p className="text-xs text-muted-foreground">Leave empty for unlimited budget. Campaign pauses automatically when budget is reached.</p>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t">
        <Switch checked={formData.isActive} onCheckedChange={c => setFormData({...formData, isActive: c})} />
        <div className="space-y-0.5">
          <Label>Campaign Active Status</Label>
          <p className="text-xs text-muted-foreground">Turn on to immediately start serving this ad.</p>
        </div>
      </div>
    </div>
  );
}
