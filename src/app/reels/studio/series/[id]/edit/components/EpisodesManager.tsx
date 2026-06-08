"use client";

import React, { useState } from "react";
import { ArrowUp, ArrowDown, Film, Edit2, Trash2, X, Save, Loader2, ListVideo } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface EpisodesManagerProps {
  seriesId: string;
  initialEpisodes: any[];
  onRefresh: () => void;
}

export function EpisodesManager({ seriesId, initialEpisodes, onRefresh }: EpisodesManagerProps) {
  const [episodes, setEpisodes] = useState<any[]>(initialEpisodes);
  const [isReordering, setIsReordering] = useState(false);
  const [isDeletingEp, setIsDeletingEp] = useState<string | null>(null);
  const [editingEpId, setEditingEpId] = useState<string | null>(null);
  const [editEpData, setEditEpData] = useState({ caption: "", isPremium: false, unlockPrice: 0 });

  // Sync state if initialEpisodes changes (e.g. after bulk upload)
  React.useEffect(() => {
    setEpisodes(initialEpisodes);
  }, [initialEpisodes]);

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
        onRefresh();
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

  return (
    <div className="bg-[#121212] rounded-2xl border border-white/5 shadow-2xl p-6 mb-8">
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
  );
}
