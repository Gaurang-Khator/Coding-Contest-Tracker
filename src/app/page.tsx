import { Metadata } from "next";
import ContestCard from "@/components/ContestCard";
import ContestsSearch from "@/components/ContestsSearch";
import Header from "@/components/Header";
import PlatFormFilters from "@/components/PlatformFilters";
import axios from "axios";
import { Contest } from "./types/contest";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { Sun } from "lucide-react";
import ToggleTheme from "@/components/ToggleTheme";

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
  // Try different possible field names for start time
  const startTime = contest.startTime || 
                   (contest as any).start_time || 
                   (contest as any).startDate || 
                   (contest as any).start || 
                   null;
  
  if (!startTime) {
    // If no start time is found, return current time as fallback
    return new Date();
  }
  
  return new Date(startTime);
};

// Helper function to get contest end time safely
const getContestEndTime = (contest: Contest): Date => {
  try {
    // Try different possible field names for end time
    const endTime = (contest as any).endTime || 
                   (contest as any).end_time || 
                   (contest as any).endDate || 
                   (contest as any).end || 
                   (contest as any).duration || 
                   null;
    
    if (endTime) {
      const endDate = new Date(endTime);
      if (!isNaN(endDate.getTime())) {
        return endDate;
      }
    }
    
    // If no direct end time, calculate from start time + duration
    const startTime = getContestStartTime(contest);
    
    // Try to get duration if available
    const duration = (contest as any).duration || 
                    (contest as any).durationSeconds || 
                    (contest as any).length || 
                    null;
    
    if (duration) {
      // If duration is in seconds
      if (typeof duration === 'number') {
        return new Date(startTime.getTime() + duration * 1000);
      }
      // If duration is in minutes or hours (handle string format)
      if (typeof duration === 'string') {
        const durationMs = parseDuration(duration);
        return new Date(startTime.getTime() + durationMs);
      }
    }
    
    // Default fallback: assume 2 hours duration
    return new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
  } catch (error) {
    // If any error occurs, return start time + 2 hours
    const startTime = getContestStartTime(contest);
    return new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
  }
};

// Helper function to parse duration strings (e.g., "2h 30m", "150m", "2:30:00")
const parseDuration = (duration: string): number => {
  // Handle formats like "2h 30m", "150m", "2:30:00"
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
  
  // Assume it's minutes if just a number
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

// Helper function to determine if a contest is upcoming (for backward compatibility)
const isUpcomingContest = (contest: Contest): boolean => {
  return getContestStatus(contest) === 'upcoming';
};

// Helper function to sort contests: ongoing first, then upcoming, then limited completed
const sortContests = (contests: Contest[]): Contest[] => {
  // Separate contests by status
  const ongoingContests = contests.filter(contest => getContestStatus(contest) === 'ongoing');
  const upcomingContests = contests.filter(contest => getContestStatus(contest) === 'upcoming');
  const completedContests = contests.filter(contest => getContestStatus(contest) === 'completed');
  
  // Sort ongoing contests by earliest start time first (most recently started)
  const sortedOngoing = ongoingContests.sort((a, b) => {
    const aStartTime = getContestStartTime(a).getTime();
    const bStartTime = getContestStartTime(b).getTime();
    return bStartTime - aStartTime; // Most recent first
  });
  
  // Sort upcoming contests by earliest start time first
  const sortedUpcoming = upcomingContests.sort((a, b) => {
    const aStartTime = getContestStartTime(a).getTime();
    const bStartTime = getContestStartTime(b).getTime();
    return aStartTime - bStartTime;
  });
  
  // Sort completed contests by most recent start time first
  const sortedCompleted = completedContests.sort((a, b) => {
    const aStartTime = getContestStartTime(a).getTime();
    const bStartTime = getContestStartTime(b).getTime();
    return bStartTime - aStartTime;
  });
  
  // Group completed contests by platform and limit to 3 per platform
  const completedByPlatform = sortedCompleted.reduce((acc, contest) => {
    const platform = contest.platform.toLowerCase();
    if (!acc[platform]) {
      acc[platform] = [];
    }
    if (acc[platform].length < 3) {
      acc[platform].push(contest);
    }
    return acc;
  }, {} as Record<string, Contest[]>);
  
  // Flatten the limited completed contests
  const limitedCompleted = Object.values(completedByPlatform).flat();
  
  // Add section markers for UI (you can use these in your ContestCard component)
  const result = [];
  
  if (sortedOngoing.length > 0) {
    result.push(
      { type: 'section-header', title: 'Ongoing Contests', id: 'ongoing-header' } as any,
      ...sortedOngoing
    );
  }
  
  if (sortedUpcoming.length > 0) {
    result.push(
      { type: 'section-header', title: 'Upcoming Contests', id: 'upcoming-header' } as any,
      ...sortedUpcoming
    );
  }
  
  if (limitedCompleted.length > 0) {
    result.push(
      { type: 'section-header', title: 'Recent Completed Contests', id: 'completed-header' } as any,
      ...limitedCompleted
    );
  }
  
  return result;
};

export default async function Home({ params, searchParams }: PageProps) {
  const searchParamsResolved = await searchParams;
  const platform = searchParamsResolved?.platform?.toString().toLowerCase();
  const searchQuery = searchParamsResolved?.contest?.toString();

  let contests: Contest[] = [];
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
      contests = bookmarkedContests;
    } else if (!platform || platform === "all platforms") {
      const [codechefData, codeforcesData, leetcodeData] = await Promise.all([
        fetch(`${baseUrl}/api/codechef`).then((res) => res.json()),
        fetch(`${baseUrl}/api/codeforces`).then((res) => res.json()),
        fetch(`${baseUrl}/api/leetcode`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        }).then((res) => res.json()),
      ]);

      contests = [
        ...(Array.isArray(codechefData) ? codechefData : []),
        ...(Array.isArray(codeforcesData) ? codeforcesData : []),
        ...(Array.isArray(leetcodeData) ? leetcodeData : [])
      ];
    } else {
      const response = await fetch(`${baseUrl}/api/${platform}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();
      contests = Array.isArray(data) ? data : [];
    }

    // Apply search filter if query exists
    if (searchQuery) {
      contests = contests.filter(
        (contest) =>
          contest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contest.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contest.id.toString().includes(searchQuery.toString())
      );
    }

    // Sort contests: upcoming first, then completed
    contests = sortContests(contests);

  } catch (error) {
    console.error("Error fetching contests:", error);
    contests = [];
  }

  return (
    <div className="font-[family-name:var(--font-geist-sans)] min-h-screen">
      <div className="my-8 sm:my-12">
        <div className="relative max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <Header />
            <ToggleTheme />
          </div>
          <Suspense fallback={<div>Loading filters...</div>}>
            <PlatFormFilters />
          </Suspense>
        </div>
      </div>
      <Suspense fallback={<div>Loading search...</div>}>
        <ContestsSearch />
      </Suspense>
      <ContestCard 
        contests={contests}
        isBookmarksPage={isBookmarksPage}
        bookmarkedContestIds={bookmarkedContestIds}
      />
    </div>
  );
}