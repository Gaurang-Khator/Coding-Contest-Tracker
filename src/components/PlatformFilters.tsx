"use client";
import { cn } from "@/lib/utils";
import { Bookmark, FileCode, Globe, icons, Youtube } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PlatformFilters() {
  const testFetch = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/youtube/fetch-playlist`);
      const data = await response.json();
      toast.success(`Successfully fetched ${data.count} videos`);
    } catch (error) {
      toast.error("Failed to fetch videos");
    }
  };

  const buttons = [
    {
      icon: <Globe size={14} color="lightblue" />,
      title: "All Platforms",
      className: "bg-icon text-white",
    },
    {
      icon: "CF",
      title: "Codeforces",
      className: "bg-cf-secondary text-cf-primary",
    },
    {
      icon: "LC",
      title: "LeetCode",
      className: "bg-lc-secondary text-lc-primary",
    },
    {
      icon: "CC",
      title: "CodeChef",
      className: "bg-cc-secondary text-cc-primary",
    },
    {
      icon: <Bookmark size={14} color="lightblue" />,
      title: "Bookmarks",
      className: "bg-primary text-white",
    },
  ];
  const router = useRouter();
  const searchParams = useSearchParams();
  const platform = searchParams.get("platform");
  const isActive = (currPlatform: string) => {
    if (currPlatform === "all platforms") {
      return !platform;
    }
    return platform === currPlatform;
  };
  const fetchActiveStyles = (platform: string): string => {
    switch (platform) {
      case "codeforces":
        return "bg-cf text-cf-secondary";
      case "codechef":
        return "bg-cc text-cc-secondary";
      case "leetcode":
        return "bg-lc text-lc-secondary";
      default:
        return "bg-icon text-white";
    }
  };
  const fetchInActiveStyles = (platform: string): string => {
    switch (platform) {
      case "codeforces":
        return "bg-cf-secondary text-cf-primary";
      case "codechef":
        return "bg-cc-secondary text-cc-primary";
      case "leetcode":
        return "bg-lc-secondary text-lc-primary";
      default:
        return "bg-inactive text-icon";
    }
  };

  const createQueryString = (newPlatform: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const contest = params.get("contest");

    const newParams = new URLSearchParams();

    if (newPlatform.toLowerCase() !== "all platforms") {
      newParams.set("platform", newPlatform.toLowerCase());
    }

    if (contest) {
      newParams.set("contest", contest);
    }

    return newParams.toString();
  };

  return (
    <div className="flex items-center w-full justify-start md:justify-center gap-2 my-4 sm:my-8 px-4 overflow-x-auto no-scrollbar">
      {buttons.map((button) => {
        const queryString = createQueryString(button.title);
        const href = queryString ? `/?${queryString}` : "/";

        return (
          <div
            key={button.title}
            className="cursor-pointer transform hover:scale-105 active:scale-95 hover:shadow-elevation-low transition-all duration-300"
          >
            <Link
              className={cn(
                `cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border border-transparent whitespace-nowrap ${button.className}`,
                `${
                  isActive(button.title.toLowerCase())
                    ? `${fetchActiveStyles(button.title.toLowerCase())}`
                    : `${fetchInActiveStyles(button.title.toLowerCase())}`
                }`
              )}
              href={href}
              replace
            >
              <span className="text-xs font-bold">{button.icon}</span>
              <span className="font-medium">{button.title}</span>
            </Link>
          </div>
        );
      })}
      <Button
        onClick={() => {
          router.push("/form");
        }}
        variant="outline"
        className={cn(
          "transform hover:scale-105 active:scale-95 hover:shadow-elevation-low transition-all duration-300 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0",
          "cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border border-transparent whitespace-nowrap"
        )}
      >
        <Youtube className="h-4 w-4" />
        <span>Upload YT Link</span>
      </Button>
      
    </div>
  );
}
