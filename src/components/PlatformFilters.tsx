"use client";
import { cn } from "@/lib/utils";
import { Bookmark, FileCode, Globe } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "./ui/button";

const platforms = [
	{ name: "All Platforms", value: "all platforms", color: "bg-slate-600", icon: Globe },
	{ name: "Codeforces", value: "codeforces", color: "bg-blue-600", icon: FileCode },
	{ name: "LeetCode", value: "leetcode", color: "bg-yellow-600", icon: FileCode },
	{ name: "CodeChef", value: "codechef", color: "bg-orange-600", icon: FileCode },
	{ name: "Bookmarks", value: "bookmarks", color: "bg-pink-600", icon: Bookmark },
];

export default function PlatformFilters() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const platform = searchParams?.get("platform") || "all platforms";

	const handlePlatformChange = (platform: string) => {
		const params = new URLSearchParams(searchParams?.toString() || "");
		params.set("platform", platform);
		router.push(`?${params.toString()}`);
	};

	return (
		<div className="flex items-center w-full justify-start md:justify-start gap-2 my-4 sm:my-8 px-0 overflow-x-auto pb-2">
			<div className="flex gap-2 flex-wrap">
				{platforms.map((btn) => {
					const IconComponent = btn.icon;
					return (
						<Button
							key={btn.value}
							onClick={() => handlePlatformChange(btn.value)}
							variant={platform === btn.value ? "default" : "outline"}
							className={cn(
								"transform hover:scale-105 active:scale-95 transition-all duration-300",
								platform === btn.value
									? `${btn.color} text-white border-0`
									: "hover:bg-muted",
								"cursor-pointer flex items-center gap-2 px-4 py-2 text-sm rounded-lg border whitespace-nowrap"
							)}
						>
							<IconComponent className="h-4 w-4" />
							<span className="font-medium">{btn.name}</span>
						</Button>
					);
				})}
			</div>
		</div>
	);
}
