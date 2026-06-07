"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, X, Film, UploadCloud } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

const KUKU_GENRES = [
  "Romance", "CEO", "Werewolf", "Billionaire", "Revenge", 
  "Drama", "Fantasy", "Action", "Suspense", "Comedy"
];

export default function CreateSeriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<{ url: string; id: string } | null>(null);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");

    setLoading(true);
    try {
      const res = await fetch("/api/reels/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          genre,
          language,
          ageRating,
          director,
          releaseYear: Number(releaseYear),
          isPremium,
          defaultPricePerEpisode: Number(coinPrice),
          cast,
          coverImageId: coverImage?.id || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Series created successfully!");
        router.push("/reels/studio");
      } else {
        toast.error(data.error || "Failed to create series");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
          <Link href="/reels/studio" className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Mini-Drama</h1>
            <p className="text-white/50 text-sm mt-1">Set up the metadata and poster for your new series.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Metadata */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Title & Description */}
            <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Series Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                  placeholder="e.g. The Billionaire's Secret"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition h-32 resize-none"
                  placeholder="What is this series about?"
                />
              </div>
            </div>

            {/* Classification */}
            <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-lg font-bold border-b border-white/5 pb-3">Classification</h3>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-semibold mb-2">Genre</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition appearance-none"
                  >
                    <option value="">Select Genre...</option>
                    {KUKU_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Age Rating</label>
                  <select
                    value={ageRating}
                    onChange={(e) => setAgeRating(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition appearance-none"
                  >
                    <option value="G">G</option>
                    <option value="PG">PG</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                    <option value="TV-MA">TV-MA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition appearance-none"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="hi">Hindi</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Release Year</label>
                  <input
                    type="number"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(Number(e.target.value))}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Cast & Crew */}
            <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-lg font-bold border-b border-white/5 pb-3">Cast & Crew</h3>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Director</label>
                <input
                  type="text"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                  placeholder="Name of director"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Cast Members</label>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={castMember}
                    onChange={(e) => setCastMember(e.target.value)}
                    onKeyDown={addCast}
                    className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                    placeholder="Enter actor name and hit Enter"
                  />
                  <button type="button" onClick={addCast} className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                {cast.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {cast.map(c => (
                      <div key={c} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm">
                        <span>{c}</span>
                        <button type="button" onClick={() => removeCast(c)} className="text-white/50 hover:text-white transition">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Monetization */}
            <div className="bg-linear-to-r from-yellow-500/10 to-orange-500/10 p-6 rounded-2xl border border-yellow-500/20 space-y-4">
              <h3 className="text-lg font-bold border-b border-yellow-500/20 pb-3 text-yellow-500">Monetization</h3>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="w-5 h-5 accent-yellow-500" 
                />
                <span className="font-semibold text-yellow-100">Premium Series</span>
              </label>

              {isPremium && (
                <div className="pt-2">
                  <label className="block text-sm font-semibold mb-2 text-yellow-100">Default Coins per Episode</label>
                  <input
                    type="number"
                    min="1"
                    value={coinPrice}
                    onChange={(e) => setCoinPrice(Number(e.target.value))}
                    className="w-full bg-black border border-yellow-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition"
                  />
                  <p className="text-xs text-yellow-500/70 mt-2">Users will spend this many coins to unlock each locked episode.</p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Media Uploads */}
          <div className="space-y-6">
            
            {/* Poster Upload */}
            <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center">
              <h3 className="text-lg font-bold mb-4 self-start">Series Poster</h3>
              
              <div className="w-full max-w-[200px] aspect-[2/3] bg-black border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center overflow-hidden relative">
                {coverImage?.url ? (
                  <>
                    <img src={coverImage.url} alt="Cover" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setCoverImage(null)}
                      className="absolute top-2 right-2 bg-red-500/80 p-1.5 rounded-full hover:bg-red-500 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 z-10 w-full h-full [&>div]:h-full [&>div]:w-full [&>div>div]:border-none [&>div>div]:bg-transparent">
                     <ImageUpload value={coverImage} onChange={setCoverImage} />
                  </div>
                )}
              </div>
              <p className="text-xs text-white/50 mt-4">Vertical format recommended (2:3 aspect ratio). This will be displayed on the Mini-Dramas discover grid.</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Film className="w-5 h-5" />}
              {loading ? "Creating Series..." : "Create Mini-Drama"}
            </button>
            
          </div>
        </form>
      </div>
    </div>
  );
}
