"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Search,
  Trash2,
  Star,
  Film,
  User,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Review {
  id: string;
  userId: string;
  userName: string | null;
  movieId: string;
  movieTitle: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  likesCount: number;
  createdAt: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating
              ? "text-amber-400 fill-amber-400"
              : "text-muted-foreground/30 fill-muted-foreground/10"
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-muted-foreground">
        {rating}/5
      </span>
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const res = await fetch(`/api/movie/admin-reviews?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.pages || 0);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    fetchReviews();
  }, [page, limit, searchTerm]);

  const handleToggleApproval = async (review: Review) => {
    const newApproved = !review.isApproved;
    try {
      const res = await fetch(`/api/movie/reviews/${review.id}/approval`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: newApproved }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      toast.success(newApproved ? "Review approved" : "Review rejected");
      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id ? { ...r, isApproved: newApproved } : r
        )
      );
    } catch (e: any) {
      toast.error(e.message || "Failed to update review");
    }
  };

  const handleDelete = async (review: Review) => {
    if (!confirm(`Delete this review by "${review.userName}"? This cannot be undone.`))
      return;
    try {
      const res = await fetch(`/api/movie/reviews/${review.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      toast.success("Review deleted");
      fetchReviews();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete review");
    }
  };

  const renderPageNumbers = () => {
    const pages: React.ReactNode[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) {
      pages.push(
        <Button
          key={i}
          variant={page === i ? "default" : "outline"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setPage(i)}
        >
          {i}
        </Button>
      );
    }
    return pages;
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Reviews
          </h1>
          <p className="text-muted-foreground mt-1">
            Moderate and manage user reviews for all movies.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1.5 py-1 px-3">
            <MessageSquare className="h-3.5 w-3.5" />
            {total} total
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-xl border border-muted">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by movie title..."
            className="pl-8 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading && reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <span className="text-muted-foreground text-sm animate-pulse">
            Loading reviews...
          </span>
        </div>
      ) : (
        <Card className="border-muted shadow-xs">
          <CardContent className="p-0">
            <div className="rounded-t-lg border-b overflow-x-auto relative">
              {loading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                  <div className="h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                </div>
              )}
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0">
                  <TableRow>
                    <TableHead>Movie</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <TableRow
                        key={review.id}
                        className="hover:bg-muted/40 transition-colors align-top"
                      >
                        <TableCell className="py-3">
                          <div className="flex items-center gap-1.5">
                            <Film className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <span className="font-medium text-sm">
                              {review.movieTitle}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <div>
                              <div className="text-sm font-medium">
                                {review.userName || "Anonymous"}
                              </div>
                              {review.isVerifiedPurchase && (
                                <div className="flex items-center gap-0.5 mt-0.5">
                                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                  <span className="text-[10px] text-emerald-600 font-medium">
                                    Verified
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <StarRating rating={review.rating} />
                        </TableCell>
                        <TableCell className="py-3 max-w-[280px]">
                          {review.title && (
                            <p className="text-sm font-semibold leading-tight mb-1">
                              {review.title}
                            </p>
                          )}
                          {review.comment && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                          {!review.title && !review.comment && (
                            <span className="text-xs text-muted-foreground italic">
                              No text
                            </span>
                          )}
                          {review.likesCount > 0 && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <ThumbsUp className="h-3 w-3 text-muted-foreground/60" />
                              <span className="text-[10px] text-muted-foreground">
                                {review.likesCount} likes
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 border shadow-none ${
                              review.isApproved
                                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                : "text-red-700 bg-red-50 border-red-200"
                            }`}
                          >
                            {review.isApproved ? "Approved" : "Rejected"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(review.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-8 w-8 p-0 ${
                                review.isApproved
                                  ? "text-red-400 hover:text-red-600 hover:bg-red-50"
                                  : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                              }`}
                              onClick={() => handleToggleApproval(review)}
                              title={
                                review.isApproved
                                  ? "Reject review"
                                  : "Approve review"
                              }
                            >
                              {review.isApproved ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(review)}
                              title="Delete review"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-32 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                          <span>No reviews found.</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-muted bg-muted/10">
                <div className="text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold">
                    {Math.min(total, (page - 1) * limit + 1)}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {Math.min(total, page * limit)}
                  </span>{" "}
                  of <span className="font-semibold">{total}</span> reviews
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Rows</Label>
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className="flex h-8 rounded-md border border-input bg-background px-2 py-1 text-xs"
                    >
                      {[5, 10, 25, 50].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {renderPageNumbers()}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages || totalPages === 0}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages || totalPages === 0}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
