"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Plus, X, Film, Save, ListVideo, UploadCloud, CheckCircle2, ArrowUp, ArrowDown, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { UploadDropzone } from "../../../components/UploadDropzone";
import { EpisodeSortableItem } from "../../../components/EpisodeSortableItem";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const KUKU_GENRES = [
  "Romance", "CEO", "Werewolf", "Billionaire", "Revenge", 
  "Drama", "Fantasy", "Action", "Suspense", "Comedy"
];

export default function EditSeriesPage() {
  const router = useRouter();
  const params = useParams();
  const seriesId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<"metadata" | "episodes">("metadata");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Metadata States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("en");
  const [ageRating, setAgeRating] = useState("PG-13");
  const [director, setDirector] = useState("");
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());
  const [isPremium, setIsPremium] = useState(false);
  const [coinPrice, setCoinPrice] = useState(10);
  const [castMember, setCastMember] = useState("");
  const [cast, setCast] = useState<string[]>([]);

  // Episodes Management States
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [isReordering, setIsReordering] = useState(false);
  const [isDeletingEp, setIsDeletingEp] = useState<string | null>(null);
  const [editingEpId, setEditingEpId] = useState<string | null>(null);
  const [editEpData, setEditEpData] = useState({ caption: "", isPremium: false, unlockPrice: 0 });

  // Bulk Upload States
  const [episodesMeta, setEpisodesMeta] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, currentPercent: 0 });
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [coverImage,setCoverImage]=useState<{ url: string; hashDataUrl: string } | null>(null)

  const CHUNK_SIZE = 5 * 1024 * 1024;

  useEffect(() => {
    fetchSeriesAndEpisodes();
  }, [seriesId]);

  const fetchSeriesAndEpisodes = async () => {
    try {
      // Fetch Series Meta
      const res = await fetch(`/api/reels/series/${seriesId}`);
      const data = await res.json();
      if (data.success) {
        const s = data.series;
        setTitle(s.title || "");
        setDescription(s.description || "");
        setGenre(s.genre || "");
        setLanguage(s.language || "en");
        setAgeRating(s.ageRating || "PG-13");
        setDirector(s.director || "");
        setReleaseYear(s.releaseYear || new Date().getFullYear());
        setIsPremium(s.isPremium || false);
        setCoinPrice(s.defaultPricePerEpisode || 10);
        setCast(s.cast || []);
        
        
      } else {
        toast.error("Failed to load series metadata");
      }

      // Fetch Episodes
      const epRes = await fetch(`/api/reels/series/${seriesId}/episodes`);
      const epData = await epRes.json();
      if (epData.success) {
        setEpisodes(epData.episodes);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading series data");
    } finally {
      setInitialLoading(false);
    }
  };

  // --- Metadata Handlers ---
  const addCast = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if (('key' in e && e.key === "Enter") || ('type' in e && e.type === "click")) {
      e.preventDefault();
      if (castMember.trim() && !cast.includes(castMember.trim())) {
        setCast([...cast, castMember.trim()]);
        setCastMember("");
      }
    }
  };

  const removeCast = (name: string) => {
    setCast(cast.filter((c) => c !== name));
  };

  const handleMetadataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");

    setLoading(true);
    try {
      const res = await fetch(`/api/reels/series/${seriesId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, genre, language, ageRating, director,
          releaseYear: Number(releaseYear), isPremium, defaultPricePerEpisode: Number(coinPrice),
          cast, coverImageId: coverImage?.id || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Series metadata updated!");
      } else {
        toast.error(data.error || "Failed to update series");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // --- Episode Reordering & Deletion Handlers ---
  const handleMoveEpisode = (index: number, direction: 'up' | 'down') => {
    const newEpisodes = [...episodes];
    if (direction === 'up' && index > 0) {
      [newEpisodes[index - 1], newEpisodes[index]] = [newEpisodes[index], newEpisodes[index - 1]];
    } else if (direction === 'down' && index < newEpisodes.length - 1) {
      [newEpisodes[index + 1], newEpisodes[index]] = [newEpisodes[index], newEpisodes[index + 1]];
    }
    setEpisodes(newEpisodes);
  };

  const handleSaveOrder = async () => {
    setIsReordering(true);
    try {
      const updates = episodes.map((ep, idx) => ({ id: ep.id, episodeNumber: idx + 1 }));
      const res = await fetch(`/api/reels/series/${seriesId}/episodes/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Episode order saved!");
        fetchSeriesAndEpisodes();
      } else {
        toast.error("Failed to save order");
      }
    } catch (e) {
      toast.error("Error saving order");
    } finally {
      setIsReordering(false);
    }
  };

  const handleDeleteEpisode = async (id: string) => {
    if (!confirm("Delete this episode permanently?")) return;
    setIsDeletingEp(id);
    try {
      const res = await fetch(`/api/reels/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setEpisodes(episodes.filter(e => e.id !== id));
        toast.success("Episode deleted");
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch (err) {
      toast.error("Error deleting episode");
    } finally {
      setIsDeletingEp(null);
    }
  };

  const handleStartEditEp = (ep: any) => {
    setEditingEpId(ep.id);
    setEditEpData({ caption: ep.caption || "", isPremium: ep.isPremium || false, unlockPrice: ep.unlockPrice || 0 });
  };

  const handleSaveEditEp = async () => {
    if (!editingEpId) return;
    try {
      const res = await fetch(`/api/reels/${editingEpId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editEpData)
      });
      const data = await res.json();
      if (data.success) {
        setEpisodes(episodes.map(e => e.id === editingEpId ? { ...e, ...editEpData } : e));
        setEditingEpId(null);
        toast.success("Episode updated");
      } else {
        toast.error(data.error || "Failed to update");
      }
    } catch (e) {
      toast.error("Error updating episode");
    }
  };

  // --- Bulk Upload Handlers ---
  const handleFilesDrop = (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    let newFiles: File[] = [];
    if ('dataTransfer' in e) {
      newFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('video/'));
    } else if (e.target && 'files' in e.target && e.target.files) {
      newFiles = Array.from(e.target.files).filter(f => f.type.startsWith('video/'));
    }
    newFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    
    const newMeta = newFiles.map(f => ({
      caption: f.name.replace(/\.[^/.]+$/, ""),
      isPremium,
      unlockPrice: coinPrice,
      file: f
    }));
    setEpisodesMeta([...episodesMeta, ...newMeta]);
  };

  const uploadVideo = async (file: File) => {
    const partsCount = Math.ceil(file.size / CHUNK_SIZE);
    const initRes = await fetch("/api/upload/multipart/init", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, contentType: file.type, parts: partsCount }),
    });
    const initData = await initRes.json();
    if (!initData.uploadId) throw new Error("Failed to init upload");

    const { uploadId, key, urls } = initData;
    const uploadedParts = [];
    for (let i = 0; i < partsCount; i++) {
      const start = i * CHUNK_SIZE;
      const chunk = file.slice(start, Math.min(start + CHUNK_SIZE, file.size));
      const uploadRes = await fetch(urls[i], { method: "PUT", body: chunk });
      const etag = uploadRes.headers.get("ETag");
      if (!etag) throw new Error("No ETag received");
      uploadedParts.push({ PartNumber: i + 1, ETag: etag.replace(/"/g, "") });
      setUploadProgress(prev => ({ ...prev, currentPercent: Math.round(((i + 1) / partsCount) * 100) }));
    }

    const completeRes = await fetch("/api/upload/multipart/complete", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId, key, parts: uploadedParts }),
    });
    const completeData = await completeRes.json();
    if (!completeData.success) throw new Error("Failed to complete upload");
    return completeData.videoId;
  };

  const handleBulkSubmit = async () => {
    if (episodesMeta.length === 0) return;
    setUploading(true);
    try {
      const uploadedEpisodes = [];
      setUploadProgress({ current: 0, total: episodesMeta.length, currentPercent: 0 });
      
      for (let i = 0; i < episodesMeta.length; i++) {
        const meta = episodesMeta[i];
        setUploadProgress(prev => ({ ...prev, current: i + 1, currentPercent: 0 }));
        const videoId = await uploadVideo(meta.file);
        uploadedEpisodes.push({ videoId, caption: meta.caption, isPremium: meta.isPremium, unlockPrice: meta.unlockPrice });
      }

      const res = await fetch("/api/reels/bulk", {
         method: "POST", headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ seriesId, episodes: uploadedEpisodes })
      });
      const data = await res.json();
      if (data.success) {
         toast.success(`Successfully uploaded ${data.count} episodes!`);
         setEpisodesMeta([]);
         fetchSeriesAndEpisodes();
      } else {
         toast.error("Failed to upload episodes");
      }
    } catch(e) {
      toast.error("Error uploading");
    } finally {
      setUploading(false);
    }
  };

  if (initialLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Link href="/reels/studio" className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight line-clamp-1">{title || "Loading..."}</h1>
              <p className="text-white/50 text-sm mt-1">Manage metadata and episodes for this series.</p>
            </div>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10">
          <button 
            onClick={() => setActiveTab("metadata")}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${activeTab === "metadata" ? "border-indigo-500 text-indigo-400 bg-indigo-500/10" : "border-transparent text-white/50 hover:text-white"}`}
          >
            Series Metadata
          </button>
          <button 
            onClick={() => setActiveTab("episodes")}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${activeTab === "episodes" ? "border-indigo-500 text-indigo-400 bg-indigo-500/10" : "border-transparent text-white/50 hover:text-white"}`}
          >
            Episode Management
          </button>
        </div>

        {/* Tab Content: Metadata */}
        {activeTab === "metadata" && (
          <form onSubmit={handleMetadataSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Series Title <span className="text-red-500">*</span></label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 h-32 focus:border-indigo-500 outline-none resize-none" />
                </div>
              </div>

              <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-lg font-bold border-b border-white/5 pb-3">Classification</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Genre</label>
                    <select value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:border-indigo-500 outline-none appearance-none">
                      <option value="">Select Genre...</option>
                      {KUKU_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Age Rating</label>
                    <select value={ageRating} onChange={(e) => setAgeRating(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:border-indigo-500 outline-none appearance-none">
                      <option value="G">G</option><option value="PG">PG</option><option value="PG-13">PG-13</option><option value="R">R</option><option value="TV-MA">TV-MA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Language</label>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:border-indigo-500 outline-none appearance-none">
                      <option value="en">English</option><option value="es">Spanish</option><option value="hi">Hindi</option><option value="zh">Chinese</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Release Year</label>
                    <input type="number" value={releaseYear} onChange={(e) => setReleaseYear(Number(e.target.value))} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:border-indigo-500 outline-none" />
                  </div>
                </div>
              </div>

              <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-lg font-bold border-b border-white/5 pb-3">Cast & Crew</h3>
                <div>
                  <label className="block text-sm font-semibold mb-2">Director</label>
                  <input type="text" value={director} onChange={(e) => setDirector(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Cast Members</label>
                  <div className="flex gap-2 mb-3">
                    <input type="text" value={castMember} onChange={(e) => setCastMember(e.target.value)} onKeyDown={addCast} className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-3 focus:border-indigo-500 outline-none" />
                    <button type="button" onClick={addCast} className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition"><Plus className="w-5 h-5" /></button>
                  </div>
                  {cast.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {cast.map(c => (
                        <div key={c} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm">
                          <span>{c}</span>
                          <button type="button" onClick={() => removeCast(c)} className="text-white/50 hover:text-white transition"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-6 rounded-2xl border border-yellow-500/20 space-y-4">
                <h3 className="text-lg font-bold border-b border-yellow-500/20 pb-3 text-yellow-500">Monetization</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="w-5 h-5 accent-yellow-500" />
                  <span className="font-semibold text-yellow-100">Premium Series</span>
                </label>
                {isPremium && (
                  <div className="pt-2">
                    <label className="block text-sm font-semibold mb-2 text-yellow-100">Default Coins per Episode</label>
                    <input type="number" min="1" value={coinPrice} onChange={(e) => setCoinPrice(Number(e.target.value))} className="w-full bg-black border border-yellow-500/30 rounded-lg px-4 py-3 focus:border-yellow-500 outline-none" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 flex flex-col items-center">
                <h3 className="text-lg font-bold mb-4 self-start">Series Poster</h3>
                <div className="w-full max-w-[200px] aspect-[2/3] bg-black border-2 border-dashed border-white/20 rounded-xl relative overflow-hidden">
                  {coverImage?.url ? (
                    <>
                      <img src={coverImage.url} alt="Cover" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setCoverImage(null)} className="absolute top-2 right-2 bg-red-500 p-1.5 rounded-full hover:bg-red-400 transition"><X className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <div className="absolute inset-0 [&>div]:h-full [&>div]:w-full [&>div>div]:border-none [&>div>div]:bg-transparent">
                      <ImageUpload value={coverImage} onChange={setCoverImage} />
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex justify-center items-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Changes
              </button>
            </div>
          </form>
        )}

        {/* Tab Content: Episodes */}
        {activeTab === "episodes" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Existing Episodes Table */}
            <div className="bg-[#121212] rounded-2xl border border-white/5 shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ListVideo className="text-indigo-500" /> Published Episodes ({episodes.length})
                </h2>
                <button 
                  onClick={handleSaveOrder}
                  disabled={isReordering || episodes.length === 0}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isReordering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save New Order
                </button>
              </div>

              <div className="overflow-x-auto border border-white/10 rounded-xl">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10">
                      <TableHead className="w-[80px]">Ep No.</TableHead>
                      <TableHead className="w-[100px]">Reorder</TableHead>
                      <TableHead className="w-[120px]">Thumbnail</TableHead>
                      <TableHead>Caption / Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {episodes.length === 0 ? (
                      <TableRow className="border-white/10">
                        <TableCell colSpan={6} className="text-center h-32 text-white/40">No episodes yet. Upload below.</TableCell>
                      </TableRow>
                    ) : episodes.map((ep, idx) => (
                      <TableRow key={ep.id} className="border-white/10 hover:bg-white/5 transition group">
                        <TableCell className="font-bold text-indigo-400">#{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <button onClick={() => handleMoveEpisode(idx, 'up')} disabled={idx === 0 || editingEpId !== null} className="p-1 hover:bg-white/10 rounded disabled:opacity-20"><ArrowUp className="w-4 h-4" /></button>
                            <button onClick={() => handleMoveEpisode(idx, 'down')} disabled={idx === episodes.length - 1 || editingEpId !== null} className="p-1 hover:bg-white/10 rounded disabled:opacity-20"><ArrowDown className="w-4 h-4" /></button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-16 h-24 bg-black rounded-md overflow-hidden relative">
                            {ep.video?.posterUrl ? <img src={ep.video.posterUrl} className="w-full h-full object-cover" /> : <div className="absolute inset-0 bg-white/5 flex items-center justify-center text-white/20"><Film className="w-6 h-6" /></div>}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium max-w-xs truncate">
                          {editingEpId === ep.id ? (
                            <input type="text" value={editEpData.caption} onChange={(e) => setEditEpData({ ...editEpData, caption: e.target.value })} className="w-full bg-black border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500" />
                          ) : (ep.caption || "Untitled Episode")}
                        </TableCell>
                        <TableCell>
                          {editingEpId === ep.id ? (
                            <div className="flex flex-col gap-2">
                              <label className="flex items-center gap-2 text-xs">
                                <input type="checkbox" checked={editEpData.isPremium} onChange={(e) => setEditEpData({ ...editEpData, isPremium: e.target.checked })} /> Premium
                              </label>
                              {editEpData.isPremium && (
                                <input type="number" value={editEpData.unlockPrice} onChange={(e) => setEditEpData({ ...editEpData, unlockPrice: Number(e.target.value) })} className="w-16 bg-black border border-white/10 rounded px-2 py-1 text-xs outline-none focus:border-indigo-500" />
                              )}
                            </div>
                          ) : (
                            ep.isPremium ? <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-md font-semibold">Premium ({ep.unlockPrice}c)</span> : <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md font-semibold">Free</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingEpId === ep.id ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingEpId(null)} className="p-2 text-white/50 hover:bg-white/10 rounded-lg transition"><X className="w-4 h-4" /></button>
                              <button onClick={handleSaveEditEp} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"><Save className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleStartEditEp(ep)}
                                disabled={editingEpId !== null}
                                className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition disabled:opacity-50"
                                title="Edit Episode"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteEpisode(ep.id)}
                                disabled={isDeletingEp === ep.id || editingEpId !== null}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                                title="Delete Episode"
                              >
                                {isDeletingEp === ep.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Bulk Upload Section */}
            <div className="bg-[#121212] rounded-2xl border border-white/5 shadow-2xl p-6">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <UploadCloud className="text-indigo-500" /> Upload More Episodes
              </h2>
              <UploadDropzone onFilesDrop={handleFilesDrop} />
              
              {episodesMeta.length > 0 && (
                <div className="mt-8 space-y-3">
                  {episodesMeta.map((meta, i) => (
                    <EpisodeSortableItem 
                      key={i} index={i} meta={meta}
                      draggedItemIndex={draggedItemIndex}
                      onDragStart={(e) => { setDraggedItemIndex(i); e.dataTransfer.setData("text", i.toString()); }}
                      onDragOver={(e) => { e.preventDefault(); if(draggedItemIndex !== null && draggedItemIndex !== i) { const items = [...episodesMeta]; items.splice(i, 0, items.splice(draggedItemIndex, 1)[0]); setDraggedItemIndex(i); setEpisodesMeta(items); } }}
                      onDragEnd={() => setDraggedItemIndex(null)}
                      onUpdateMeta={(idx, key, val) => { const updated = [...episodesMeta]; updated[idx][key] = val; setEpisodesMeta(updated); }}
                      onRemove={(idx) => { const updated = [...episodesMeta]; updated.splice(idx, 1); setEpisodesMeta(updated); }}
                    />
                  ))}
                  
                  <div className="pt-6 border-t border-white/10 flex justify-end">
                    <button 
                      onClick={handleBulkSubmit}
                      disabled={uploading}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition disabled:opacity-50"
                    >
                      {uploading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Uploading {uploadProgress.current}/{uploadProgress.total} ({uploadProgress.currentPercent}%)</>
                      ) : (
                        <><CheckCircle2 className="w-5 h-5" /> Publish {episodesMeta.length} New Episodes</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
