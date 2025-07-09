import { Contest } from "@/app/types/contest";

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const [codechefData, codeforcesData, leetcodeData] = await Promise.all([
      fetch(`${baseUrl}/api/codechef`).then((res) => res.json()),
      fetch(`${baseUrl}/api/codeforces`).then((res) => res.json()),
      fetch(`${baseUrl}/api/leetcode`).then((res) => res.json()),
    ]);

    const sortByStartTime = (a: Contest, b: Contest) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime();

    const sortedCodechef = codechefData.sort(sortByStartTime);
    const sortedCodeforces = codeforcesData.sort(sortByStartTime);
    const sortedLeetcode = leetcodeData.sort(sortByStartTime);

    const allContests: Contest[] = [
      ...sortedCodechef,
      ...sortedCodeforces,
      ...sortedLeetcode,
    ];

    return Response.json(allContests);
  } catch (error) {
    console.error("Error fetching contests:", error);
    return Response.json(
      { error: "Failed to fetch contests" },
      { status: 500 }
    );
  }
}
