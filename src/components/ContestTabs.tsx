"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ContestCard from "@/components/ContestCard";
import { Contest } from "@/app/types/contest";
import { Zap, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContestTabsProps {
  contests: (Contest & { type?: string; title?: string; status?: string })[];
  isBookmarksPage: boolean;
  bookmarkedContestIds: string[];
}

type TabType = "upcoming" | "completed";

export default function ContestTabs({
  contests,
  isBookmarksPage,
  bookmarkedContestIds,
}: ContestTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");

  // Separate contests by status
  const upcomingContests = contests.filter(
    (c) => (c as any).status === "upcoming" || (c as any).status === "ongoing"
  );

  const completedContests = contests.filter(
    (c) => (c as any).status === "completed"
  );

  // Count for badges
  const upcomingCount = upcomingContests.length;
  const completedCount = completedContests.length;

  return (
    <div className="space-y-6">
      {/* Tab Buttons */}
      <div className="flex gap-0 border-b border-border">
        <Button
          onClick={() => setActiveTab("upcoming")}
          variant="ghost"
          className={cn(
            "relative px-6 py-3 font-semibold transition-all rounded-none",
            activeTab === "upcoming"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Zap className="w-4 h-4 mr-2" />
          Upcoming Contests
          <span className="ml-2 px-2.5 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
            {upcomingCount}
          </span>
        </Button>

        <Button
          onClick={() => setActiveTab("completed")}
          variant="ghost"
          className={cn(
            "relative px-6 py-3 font-semibold transition-all rounded-none",
            activeTab === "completed"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Recently Completed
          <span className="ml-2 px-2.5 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
            {completedCount}
          </span>
        </Button>
      </div>

      {/* Tab Content */}
      <div className="mt-8 animate-in fade-in-50 duration-300">
        {activeTab === "upcoming" && (
          <>
            {upcomingContests.length > 0 ? (
              <ContestCard
                contests={upcomingContests}
                isBookmarksPage={isBookmarksPage}
                bookmarkedContestIds={bookmarkedContestIds}
              />
            ) : (
              <div className="text-center py-12">
                <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">
                  No upcoming contests found. Check back soon!
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === "completed" && (
          <>
            {completedContests.length > 0 ? (
              <ContestCard
                contests={completedContests}
                isBookmarksPage={isBookmarksPage}
                bookmarkedContestIds={bookmarkedContestIds}
              />
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">
                  No completed contests found. Participate in contests to see them here!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}