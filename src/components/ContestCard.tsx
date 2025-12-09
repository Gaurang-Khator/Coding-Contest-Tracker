"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Contest } from "@/app/types/contest";
import { Star, ExternalLink, Clock, Calendar } from "lucide-react";
import { useState } from "react";
import { useOptimistic } from "react";

interface ContestCardProps {
  contests: (Contest & { type?: string; title?: string; status?: string })[];
  isBookmarksPage: boolean;
  bookmarkedContestIds: string[];
}

const getPlatformColor = (platform: string) => {
  const colors: Record<string, string> = {
    codeforces: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    leetcode: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    codechef: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  };
  return colors[platform.toLowerCase()] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
};

const getStatusColor = (status?: string) => {
  const colors: Record<string, string> = {
    ongoing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    completed: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  };
  return colors[status || "upcoming"] || colors.upcoming;
};

const getStatusLabel = (status?: string) => {
  const labels: Record<string, string> = {
    ongoing: "🟢 Ongoing",
    upcoming: "🔵 Upcoming",
    completed: "⚫ Completed",
  };
  return labels[status || "upcoming"] || "Upcoming";
};

const formatDateTime = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ContestCard({
  contests,
  isBookmarksPage,
  bookmarkedContestIds,
}: ContestCardProps) {
  const [bookmarks, setBookmarks] = useState<string[]>(bookmarkedContestIds);
  const [optimisticBookmarks, addOptimisticBookmark] = useOptimistic(
    bookmarks,
    (state, contestId: string) => {
      const isBookmarked = state.includes(contestId);
      return isBookmarked ? state.filter((id) => id !== contestId) : [...state, contestId];
    }
  );

  const toggleBookmark = async (contest: Contest) => {
    const contestId = contest.id?.toString() || contest.name;
    const isBookmarked = bookmarks.includes(contestId);

    try {
      addOptimisticBookmark(contestId);
      
      const response = await fetch("/api/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isBookmarked ? "remove" : "add",
          contest,
        }),
      });

      if (!response.ok) throw new Error("Failed to update bookmark");

      setBookmarks((prev) =>
        isBookmarked ? prev.filter((id) => id !== contestId) : [...prev, contestId]
      );
    } catch (error) {
      console.error("Bookmark error:", error);
      setBookmarks(bookmarks);
    }
  };

  // Filter out section headers for grid layout
  const filteredContests = contests.filter((c) => c.type !== "section-header");

  if (filteredContests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No contests found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredContests.map((contest, index) => {
        const isBookmarked = optimisticBookmarks.includes(
          contest.id?.toString() || contest.name
        );

        return (
          <Card
            key={contest.id || index}
            className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50 flex flex-col h-full"
          >
            {/* Header with Platform and Status */}
            <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-muted/30">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge className={getPlatformColor(contest.platform)}>
                  {contest.platform}
                </Badge>
                <Badge className={getStatusColor(contest.status)}>
                  {getStatusLabel(contest.status)}
                </Badge>
              </div>
              <CardTitle className="text-lg line-clamp-2 leading-tight">
                {contest.name}
              </CardTitle>
            </CardHeader>

            {/* Content */}
            <CardContent className="flex-1 space-y-4 pt-4">
              {/* Start Time */}
              <div className="flex items-start gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Starts</p>
                  <p className="font-medium">{formatDateTime(contest.startTime)}</p>
                </div>
              </div>

              {/* Duration */}
              {(contest as any).duration && (
                <div className="flex items-start gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Duration</p>
                    <p className="font-medium">{(contest as any).duration}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  asChild
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <a
                    href={contest.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    Visit
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleBookmark(contest as Contest)}
                  className="hover:bg-primary/10"
                  title={isBookmarked ? "Remove bookmark" : "Bookmark contest"}
                >
                  <Star
                    className={`w-4 h-4 ${
                      isBookmarked ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                    }`}
                  />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}