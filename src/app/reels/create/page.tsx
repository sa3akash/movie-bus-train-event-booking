"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud, Film, Globe, Users, Lock, MessageSquare, Repeat } from "lucide-react";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

const CreateReel = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [allowComments, setAllowComments] = useState(true);
  const [allowRemixing, setAllowRemixing] = useState(true);
  
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const partsCount = Math.ceil(file.size / CHUNK_SIZE);
      
      // 1. Init multipart upload
      const initRes = await fetch("/api/upload/multipart/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          parts: partsCount,
        }),
      });
      const initData = await initRes.json();
      if (!initData.uploadId) throw new Error("Failed to init upload");

      const { uploadId, key, urls } = initData;
      const uploadedParts = [];

      // 2. Upload parts
      for (let i = 0; i < partsCount; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const uploadRes = await fetch(urls[i], {
          method: "PUT",
          body: chunk,
        });

        const etag = uploadRes.headers.get("ETag");
        if (!etag) throw new Error("No ETag received from S3");

        uploadedParts.push({
          PartNumber: i + 1,
          ETag: etag.replace(/"/g, ""), // Remove quotes from ETag
        });

        setProgress(Math.round(((i + 1) / partsCount) * 100));
      }

      // 3. Complete multipart upload
      const completeRes = await fetch("/api/upload/multipart/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId,
          key,
          parts: uploadedParts,
        }),
      });
      const completeData = await completeRes.json();
      
      if (!completeData.success || !completeData.videoId) {
        throw new Error("Failed to complete upload");
      }

      // 4. Create Reel with all new options
      const reelRes = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: completeData.videoId,
          caption,
          visibility,
          allowComments,
          allowRemixing
        }),
      });

      const reelData = await reelRes.json();
      if (reelData.success) {
        router.push("/reels");
      } else {
        throw new Error("Failed to create reel");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Film className="w-6 h-6 text-indigo-600" />
          Create New Reel
        </h1>

        <form onSubmit={handleUpload} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors bg-gray-50">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none p-1">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      className="sr-only"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">MP4, MOV, WEBM up to 2GB</p>
                {file && <p className="text-sm font-semibold text-indigo-600 mt-2">{file.name}</p>}
              </div>
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption (Use #hashtags)
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption for your reel... #funny #dance"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setVisibility("PUBLIC")}
                className={`flex flex-col items-center p-3 border rounded-lg transition-colors ${visibility === "PUBLIC" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                <Globe className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">Public</span>
              </button>
              <button
                type="button"
                onClick={() => setVisibility("FRIENDS")}
                className={`flex flex-col items-center p-3 border rounded-lg transition-colors ${visibility === "FRIENDS" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                <Users className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">Friends</span>
              </button>
              <button
                type="button"
                onClick={() => setVisibility("PRIVATE")}
                className={`flex flex-col items-center p-3 border rounded-lg transition-colors ${visibility === "PRIVATE" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                <Lock className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">Only me</span>
              </button>
            </div>
          </div>

          {/* Advanced Toggles */}
          <div className="space-y-4 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Allow Comments</p>
                  <p className="text-xs text-gray-500">Let others comment on this reel</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Allow Remixing</p>
                  <p className="text-xs text-gray-500">Let others remix this reel</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={allowRemixing} onChange={(e) => setAllowRemixing(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading {progress}%
              </span>
            ) : (
              "Post Reel"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateReel;