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
  title: "Contest Tracker",
  description: "Track programming contests from different platforms",
};

type PageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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

    if (searchQuery) {
      contests = contests.filter(
        (contest) =>
          contest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contest.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contest.id.toString().includes(searchQuery.toString())
      );
    }
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
