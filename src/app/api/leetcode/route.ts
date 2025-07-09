import parseDateString from "@/lib/parseDateString";

interface LeetCodeContest {
  title: string;
  titleSlug: string;
  duration: number;
  startTime: number;
}

export async function GET() {
  try {
    const upcomingResponse = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      body: JSON.stringify({
        query: `
          {
            allContests {
              title
              titleSlug
              startTime
              duration
            }
          }
        `,
      }),
      cache: "no-store",
    });

    let activeContests = [];
    let pastContests = [];

    if (upcomingResponse.ok) {
      const upcomingData = await upcomingResponse.json();
      activeContests = upcomingData.data?.allContests || [];
    } else {
      console.error(
        `Failed to fetch upcoming contests: ${upcomingResponse.status}`
      );
    }

    try {
      const pastResponse = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        body: JSON.stringify({
          query: `
            {
              pastContests {
                contests {
                  title
                  titleSlug
                  startTime
                  duration
                }
              }
            }
          `,
        }),
        cache: "no-store",
      });

      console.log("Past contests response status:", pastResponse.status);

      if (pastResponse.ok) {
        const pastData = await pastResponse.json();
        console.log("Past data received:", pastData ? "yes" : "no");
        pastContests = pastData.data?.pastContests?.contests || [];
        console.log(`Found ${pastContests.length} past contests`);
      } else {
        console.error(`Failed to fetch past contests: ${pastResponse.status}`);
      }
    } catch (pastError) {
      console.error("Error fetching past contests:", pastError);
    }

    const getFormattedContest = (contest: LeetCodeContest) => {
      const now = Date.now();
      const startTimeMs = contest.startTime * 1000;
      const endTimeMs = startTimeMs + contest.duration * 1000;

      let status = "upcoming";
      if (startTimeMs <= now && now <= endTimeMs) {
        status = "ongoing";
      } else if (now > endTimeMs) {
        status = "completed";
      }

      return {
        id: contest.titleSlug || `leetcode-contest-${startTimeMs}`,
        platform: "LeetCode",
        status,
        name: contest.title,
        startTime: parseDateString(new Date(startTimeMs).toISOString()),
        duration: `${Math.floor(contest.duration / 3600)} hours`,
        href: `https://leetcode.com/contest/${contest.titleSlug || ""}`,
      };
    };

    const allContests = [
      ...activeContests.map(getFormattedContest),
      ...pastContests.map(getFormattedContest),
    ];

    const uniqueContests = Array.from(
      new Map(allContests.map((contest) => [contest.id, contest])).values()
    );

    uniqueContests.sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
      return dateB - dateA;
    });

    return new Response(JSON.stringify(uniqueContests), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching LeetCode contests:", error);

    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
