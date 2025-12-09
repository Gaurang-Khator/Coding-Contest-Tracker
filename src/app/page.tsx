import { Metadata } from "next";
import ContestsSearch from "@/components/ContestsSearch";
import Header from "@/components/Header";
import PlatFormFilters from "@/components/PlatformFilters";
import { Contest } from "./types/contest";
import { Suspense } from "react";
import { cookies } from "next/headers";
import ToggleTheme from "@/components/ToggleTheme";
import ContestTabs from "@/components/ContestTabs";

export const metadata: Metadata = {
  title: "Coding Contest Tracker",
  description: "Track programming contests from different platforms",
};

type PageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Helper function to get contest start time safely
const getContestStartTime = (contest: Contest): Date => {
  const startTime = contest.startTime || 
                   (contest as any).start_time || 
                   (contest as any).startDate || 
                   (contest as any).start || 
                   null;
  
  if (!startTime) {
    return new Date();
  }
  
  return new Date(startTime);
};

// Helper function to get contest end time safely
const getContestEndTime = (contest: Contest): Date => {
  try {
    const endTime = (contest as any).endTime || 
                   (contest as any).end_time || 
                   (contest as any).endDate || 
                   (contest as any).end || 
                   (contest as any).duration || 
                   null;
    
    if (endTime && typeof endTime === 'string' && !isNaN(Date.parse(endTime))) {
      return new Date(endTime);
    }
    
    const startTime = getContestStartTime(contest);
    
    const duration = (contest as any).duration || 
                    (contest as any).durationSeconds || 
                    (contest as any).length || 
                    null;
    
    if (duration) {
      if (typeof duration === 'number') {
        return new Date(startTime.getTime() + duration);
      }
      if (typeof duration === 'string') {
        const durationMs = parseDuration(duration);
        return new Date(startTime.getTime() + durationMs);
      }
    }
    
    return new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
  } catch (error) {
    const startTime = getContestStartTime(contest);
    return new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
  }
};

// Helper function to parse duration strings
const parseDuration = (duration: string): number => {
  if (duration.includes('h') || duration.includes('m')) {
    const hours = duration.match(/(\d+)h/);
    const minutes = duration.match(/(\d+)m/);
    return ((hours ? parseInt(hours[1]) : 0) * 60 + (minutes ? parseInt(minutes[1]) : 0)) * 60 * 1000;
  }
  
  if (duration.includes(':')) {
    const parts = duration.split(':');
    const hours = parseInt(parts[0] || '0');
    const minutes = parseInt(parts[1] || '0');
    const seconds = parseInt(parts[2] || '0');
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }
  
  const mins = parseInt(duration);
  return isNaN(mins) ? 2 * 60 * 60 * 1000 : mins * 60 * 1000;
};

// Helper function to determine contest status
const getContestStatus = (contest: Contest): 'ongoing' | 'upcoming' | 'completed' => {
  const now = new Date();
  const contestStart = getContestStartTime(contest);
  const contestEnd = getContestEndTime(contest);
  
  if (now >= contestStart && now <= contestEnd) {
    return 'ongoing';
  } else if (now < contestStart) {
    return 'upcoming';
  } else {
    return 'completed';
  }
};

// Helper function to sort contests
const sortAndStatusContests = (contests: Contest[]): (Contest & { status?: string })[] => {
  return contests
    .map(c => ({
      ...c,
      status: getContestStatus(c)
    }))
    .sort((a, b) => {
      // Separate ongoing, upcoming, and completed
      const statusOrder: Record<string, number> = { ongoing: 0, upcoming: 1, completed: 2 };
      const aStatusOrder = statusOrder[(a as any).status] || 1;
      const bStatusOrder = statusOrder[(b as any).status] || 1;
      
      if (aStatusOrder !== bStatusOrder) {
        return aStatusOrder - bStatusOrder;
      }
      
      // Within same status, sort by start time
      const aStartTime = getContestStartTime(a).getTime();
      const bStartTime = getContestStartTime(b).getTime();
      
      if ((a as any).status === 'completed') {
        // For completed, show newest first
        return bStartTime - aStartTime;
      } else {
        // For upcoming/ongoing, show soonest first
        return aStartTime - bStartTime;
      }
    });
};

export default async function Home({ params, searchParams }: PageProps) {
  const searchParamsResolved = await searchParams;
  const platform = searchParamsResolved?.platform?.toString().toLowerCase();
  const searchQuery = searchParamsResolved?.contest?.toString();

  let contests: (Contest & { status?: string })[] = [];
  let isBookmarksPage = false;
  let bookmarkedContestIds: string[] = [];
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL
      : "http://localhost:3000";

    const cookieStore = await cookies();
    const bookmarksStr = cookieStore.get('bookmarks')?.value;
    const bookmarkedContests = bookmarksStr ? JSON.parse(bookmarksStr) : [];
    bookmarkedContestIds = bookmarkedContests.map((contest: Contest) => contest.id || contest.name);

    if (platform === "bookmarks") {
      isBookmarksPage = true;
      contests = sortAndStatusContests(bookmarkedContests);
    } else if (!platform || platform === "all platforms") {
      const [codechefData, codeforcesData, leetcodeData] = await Promise.all([
        fetch(`${baseUrl}/api/codechef`).then((res) => res.json()),
        fetch(`${baseUrl}/api/codeforces`).then((res) => res.json()),
        fetch(`${baseUrl}/api/leetcode`, {
          cache: 'no-store',
        }).then((res) => res.json()),
      ]);

      const allContests = [
        ...(Array.isArray(codechefData) ? codechefData : []),
        ...(Array.isArray(codeforcesData) ? codeforcesData : []),
        ...(Array.isArray(leetcodeData) ? leetcodeData : [])
      ];

      contests = sortAndStatusContests(allContests);
    } else {
      const response = await fetch(`${baseUrl}/api/${platform}`, {
        cache: 'no-store',
      });
      const data = await response.json();
      const platformContests = Array.isArray(data) ? data : [];
      contests = sortAndStatusContests(platformContests);
    }

    if (searchQuery) {
      contests = contests.filter(
        (contest) =>
          contest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contest.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contest.id?.toString().includes(searchQuery.toString())
      );
    }

  } catch (error) {
    console.error("Error fetching contests:", error);
    contests = [];
  }

  return (
    <div className="font-[family-name:var(--font-geist-sans)] min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Header />
            <ToggleTheme />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <Suspense fallback={<div className="h-12 bg-muted rounded-lg animate-pulse" />}>
          <PlatFormFilters />
        </Suspense>

        {/* Search */}
        <div className="mt-6">
          <Suspense fallback={<div className="h-12 bg-muted rounded-lg animate-pulse" />}>
            <ContestsSearch />
          </Suspense>
        </div>

        {/* Contests Tabs */}
        <div className="mt-8">
          <ContestTabs 
            contests={contests}
            isBookmarksPage={isBookmarksPage}
            bookmarkedContestIds={bookmarkedContestIds}
          />
        </div>
      </div>
    </div>
  );
}