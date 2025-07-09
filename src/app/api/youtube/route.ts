import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("contestTracker");
    const youtubeCollection = db.collection("youtube_links");

    const links = await youtubeCollection.find({}).toArray();

    const linkMap: Record<string, string> = {};

    for (const link of links) {
      if (link.platform === "codeforces") {
        linkMap[link.contestId] = link.youtubeUrl;
      } else if (link.platform === "leetcode") {
        if (link.contestId) {
          linkMap[link.contestId] = link.youtubeUrl;
          console.log(
            `Added LeetCode mapping: ${link.contestId} -> ${link.youtubeUrl}`
          );

          linkMap[link.contestId.toLowerCase()] = link.youtubeUrl;
          console.log(
            `Added LeetCode mapping: ${link.contestId.toLowerCase()} -> ${
              link.youtubeUrl
            }`
          );

          linkMap[link.contestId.replace(/-/g, " ")] = link.youtubeUrl;

          linkMap[link.contestId.replace(/\s+/g, "-")] = link.youtubeUrl;

          if (link.contestId.includes("weekly") || /\d+/.test(link.contestId)) {
            const match = link.contestId.match(/(\d+)/);
            if (match) {
              const number = match[1];
              const variations = [
                `weekly-contest-${number}`,
                `weekly_contest_${number}`,
                `weeklycontest${number}`,
                `weekly${number}`,
                `weekly contest ${number}`,
                `weekly-${number}`,
                `weekly_${number}`,
                `weekly ${number}`,
                number,
              ];

              variations.forEach((variation) => {
                linkMap[variation] = link.youtubeUrl;
                console.log(
                  `Added LeetCode weekly variation: ${variation} -> ${link.youtubeUrl}`
                );
              });
            }
          }

          if (link.contestId.includes("biweekly")) {
            const match = link.contestId.match(/(\d+)/);
            if (match) {
              const number = match[1];
              const variations = [
                `biweekly-contest-${number}`,
                `biweekly_contest_${number}`,
                `biweeklycontest${number}`,
                `biweekly${number}`,
                `biweekly contest ${number}`,
                `biweekly-${number}`,
                `biweekly_${number}`,
                `biweekly ${number}`,
              ];

              variations.forEach((variation) => {
                linkMap[variation] = link.youtubeUrl;
              });
            }
          }
        }
      } else if (link.platform === "codechef") {
        if (link.contestId) {
          linkMap[link.contestId] = link.youtubeUrl;

          const startersMatch = link.contestId.match(/STARTERS(\d+)/i);
          if (startersMatch) {
            const number = startersMatch[1];
            linkMap[`STARTERS${number}`] = link.youtubeUrl;
            linkMap[`starters${number}`] = link.youtubeUrl;
            linkMap[`Starters ${number}`] = link.youtubeUrl;
          }
        }
      } else {
        if (link.contestId) {
          linkMap[link.contestId] = link.youtubeUrl;
        }
      }
    }

    return NextResponse.json(linkMap);
  } catch (error) {
    console.error("Error fetching YouTube links:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { platform, contestId, youtubeUrl } = await request.json();

    const client = await clientPromise;

    await client
      .db("contestTracker")
      .collection("youtube_links")
      .updateOne(
        { platform, contestId },
        { $set: { platform, contestId, youtubeUrl } },
        { upsert: true }
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving YouTube link:", error);
    return NextResponse.json(
      { error: "Failed to save YouTube link" },
      { status: 500 }
    );
  }
}
