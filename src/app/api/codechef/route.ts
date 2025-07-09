import parseDateString from "@/lib/parseDateString";
import parseDuration from "@/lib/parseDuration";
interface CodeChefContest {
  contest_code: number;
  contest_name: string;
  contest_start_date_iso: string;
  contest_duration: string;
}
export async function GET() {
  const response = await fetch(
    "https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all"
  );
  const data = await response.json();
  const futureContests = data.future_contests;
  const presentContests = data.present_contests;
  const pastContests = data.past_contests;

  const getFormattedContest = (contest: CodeChefContest, status: string) => ({
    id: contest.contest_code,
    platform: "CodeChef",
    status: status,
    name: contest.contest_name,
    startTime: parseDateString(contest.contest_start_date_iso),
    duration: parseDuration(contest.contest_duration) + " hours",
    href: `https://www.codechef.com/${contest.contest_code}`,
  });

  const formattedContests = [
    ...futureContests.map((contest: CodeChefContest) =>
      getFormattedContest(contest, "upcoming")
    ),
    ...presentContests.map((contest: CodeChefContest) =>
      getFormattedContest(contest, "ongoing")
    ),
    ...pastContests.map((contest: CodeChefContest) =>
      getFormattedContest(contest, "completed")
    ),
  ];

  return Response.json(formattedContests);
}
