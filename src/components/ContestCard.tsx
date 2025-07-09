"use client";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "./ui/card";
import { Bookmark, Calendar, Clock, CloudCog, Youtube } from "lucide-react";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";
import { Contest } from "@/app/types/contest";
import Link from "next/link";
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ContestCard({ 
  contests, 
  isBookmarksPage = false,
  bookmarkedContestIds = []
}: { 
  contests: Contest[],
  isBookmarksPage?: boolean,
  bookmarkedContestIds?: string[]
}) {
  const [bookmarkedContests, setBookmarkedContests] = useState<string[]>(bookmarkedContestIds);
  const [youtubeLinks, setYoutubeLinks] = useState<Record<string, string>>({});
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    setBookmarkedContests(bookmarkedContestIds);
  }, [bookmarkedContestIds]);

  useEffect(() => {
    if (bookmarkedContestIds.length === 0) {
      const loadBookmarks = async () => {
        try {
          const response = await axios.get(`${baseUrl}/api/bookmark`);
          const bookmarks = response.data;
          const uniqueBookmarkIds = [
            ...new Set(bookmarks.map((bookmark: Contest) => bookmark.id || bookmark.name)),
          ] as string[];
          setBookmarkedContests(uniqueBookmarkIds);
        } catch (error) {
          console.error("Error loading bookmarks:", error);
        }
      };
      loadBookmarks();
    }
  }, [bookmarkedContestIds]);

  useEffect(() => {
    const loadYoutubeLinks = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/youtube`);
        const links = await response.json();
        setYoutubeLinks(links);
      } catch (error) {
        console.error("Error loading YouTube links:", error);
      }
    };
    loadYoutubeLinks();
  }, []);

  const checkPlatform = (platform: string): string => {
    switch (platform) {
      case "codeforces":
        return "bg-cf-secondary text-cf-primary";
      case "codechef":
        return "bg-cc-secondary text-cc-primary";
      case "leetcode":
        return "bg-lc-secondary text-lc-primary";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };
  const checkPlatformForBg = (platform: string): string => {
    switch (platform) {
      case "codeforces":
        return "bg-cf-primary";
      case "codechef":
        return "bg-cc-primary";
      case "leetcode":
        return "bg-lc-primary";
      default:
        return "bg-gray-200 ";
    }
  };

  const checkStatus = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-upcoming-secondary text-upcoming-primary";
      case "completed":
        return "bg-completed-secondary text-completed-primary";
      case "ongoing":
        return "bg-ongoing-secondary text-ongoing-primary";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };
  const handleBookmark = async (contest: Contest) => {
    const contestId = contest.id || contest.name;
    try {
      const isBookmarked = bookmarkedContests.includes(contestId.toString());
      const response = await axios({
        method: isBookmarked ? "DELETE" : "POST",
        url: `${baseUrl}/api/bookmark`,
        data: { ...contest, id: contestId },
      });

      if (response.status === 200) {
        setBookmarkedContests((prev) => {
          if (isBookmarked) {
            return prev.filter((id) => id !== contestId.toString());
          } else {
            return prev.includes(contestId.toString())
              ? prev
              : [...prev, contestId.toString()];
          }
        });
      }
    } catch (error) {
      console.error("Error handling bookmark:", error);
    }
  };

  const handleYT = (contest: Contest) => {
    const contestKey = getContestKey(contest);

    const youtubeUrl = youtubeLinks[contestKey];

    if (youtubeUrl) {
      window.open(youtubeUrl, "_blank");
    } else {
      router.push(`/form?contestId=${(contest.id || contest.name).toString()}`);
    }
  };

  const getContestKey = (contest: Contest): string => {
    console.log("Getting contest key for:", contest.name, contest.id);

    let contestKey = "";
    switch (contest.platform.toLowerCase()) {
      case "codechef":
        const ccMatch = contest.name.match(/Starters\s+(\d+)/i);
        contestKey = ccMatch ? `STARTERS${ccMatch[1]}` : (contest.id || contest.name).toString();
        break;
      case "leetcode":
        const lcName = contest.name.toLowerCase();
        const weeklyMatch = contest.name.match(/Weekly\s+Contest\s+(\d+)/i);
        const biweeklyMatch = contest.name.match(/Biweekly\s+Contest\s+(\d+)/i);

        if (weeklyMatch) {
          const number = weeklyMatch[1];
          contestKey = number;
        } else if (biweeklyMatch) {
          const number = biweeklyMatch[1];
          contestKey = `biweekly-contest-${number}`;
        } else if (typeof contest.id === "string" && contest.id.length > 0) {
          contestKey = contest.id;         
        } else {
          contestKey = lcName.replace(/\s+/g, "-");
        }
        break;
      case "codeforces":
        const cfMatch = contest.name.match(/Round\s+(\d+)/i);
        if (cfMatch) {
          contestKey = cfMatch[1];
        } else {
          const edMatch = contest.name.match(/Educational.*Round\s+(\d+)/i);
          if (edMatch) {
            contestKey = edMatch[1];
          } else {
            const codetonMatch = contest.name.match(/CodeTON\s+Round\s+(\d+)/i);
            if (codetonMatch) {
              contestKey = codetonMatch[1];
            } else {
              contestKey = (contest.id || contest.name).toString();
            }
          }
        }
        break;
      default:
        contestKey = (contest.id || contest.name).toString();
    }

    console.log("Generated contest key:", contestKey);
    return contestKey;
  };

  const isContestBookmarked = (contest: Contest) => {
    const contestId = (contest.id || contest.name).toString();
    
    if (isBookmarksPage) {
      return true;
    }
    return bookmarkedContests.some(id => 
      id === contestId || 
      id === contest.name || 
      id === contest.id
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
      {contests?.length > 0 ? (
        contests.map((contest: Contest) => {
          const bookmarked = isContestBookmarked(contest);
          return (
            <Card
              key={contest.id || contest.name}
              className={cn("flex flex-col items-start w-full relative group")}
            >
              <div
                className={cn(
                  "absolute top-0 left-0 right-0 h-1 rounded-t-xl",
                  checkPlatformForBg(contest.platform.toLowerCase()),
                  "transition-all duration-300",
                  "group-hover:h-2.5"
                )}
              />
              <CardHeader className="flex flex-col w-full">
                <div className={cn("w-full h-3")}></div>
                <div className="flex justify-between items-center w-full">
                  <div
                    className={cn(
                      `${checkPlatform(contest.platform.toLowerCase())}`,
                      "rounded-sm px-2 py-1 text-sm font-medium"
                    )}
                  >
                    {contest.platform}
                  </div>
                  <div
                    className={cn(
                      `${checkStatus(contest.status.toLowerCase())}`,
                      "rounded-sm px-2 py-1 text-sm font-medium uppercase"
                    )}
                  >
                    {contest.status}
                  </div>
                </div>
                <CardTitle className="font-medium mt-2">
                  {contest.name}
                </CardTitle>
                <CardDescription className="mt-2 flex flex-col gap-y-2">
                  <div className="flex items-center gap-2">
                    <div>
                      <Calendar size={16} />
                    </div>
                    <div>{contest.startTime}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <Clock size={16} />
                    </div>
                    <div>{contest.duration}</div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardFooter className="w-full flex flex-col gap-2">
                <Link
                  href={contest.href}
                  target="_blank"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-white dark:text-black dark:hover:text-white dark:hover:bg-black"
                  >
                    Visit {contest.platform}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex w-full gap-2">
                  <Button
                    variant={bookmarked ? "default" : "outline"}
                    className="flex-1 flex items-center justify-center gap-1 bg-black text-white text-xs"
                    onClick={() => handleBookmark(contest)}
                  >
                    {bookmarked ? "Bookmarked" : "Bookmark"}
                    <Bookmark
                      className={cn(
                        "h-4 w-4",
                        bookmarked ? "fill-current" : ""
                      )}
                    />
                  </Button>
                  <Button
                    variant="destructive"
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 text-xs",
                      youtubeLinks[getContestKey(contest)]
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-gray-400 hover:bg-gray-500"
                    )}
                    onClick={() => handleYT(contest)}
                  >
                    {youtubeLinks[getContestKey(contest)]
                      ? "Watch"
                      : "Add"}
                    <Youtube className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })
      ) : (
        <div className="col-span-full flex justify-center items-center text-4xl py-12">
          No Contests Found.
        </div>
      )}
    </div>
  );
}
