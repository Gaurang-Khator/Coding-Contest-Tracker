import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const PLAYLIST_IDS = {
  codechef: process.env.CODECHEF_PLAYLIST_ID,
  leetcode: process.env.LEETCODE_PLAYLIST_ID,
  codeforces: process.env.CODEFORCES_PLAYLIST_ID,
};

async function fetchPlaylistVideos(playlistId: string) {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.items;
}

function extractContestInfo(videoTitle: string, platform: string) {
  const contestName = videoTitle.split("|")[0].trim();

  switch (platform) {
    case "codechef":
      const ccMatch = contestName.match(/starters\s+(\d+)/i);
      return ccMatch ? `STARTERS${ccMatch[1]}` : null;

    case "leetcode":
      const lcMatch = contestName.match(/(weekly|biweekly)\s+contest\s+(\d+)/i);
      return lcMatch
        ? `${lcMatch[1]}-contest-${lcMatch[2]}`.toLowerCase()
        : null;

    case "codeforces":
      const cfMatch = contestName.match(/round\s+#?(\d+)/i);
      return cfMatch ? `${cfMatch[1]}` : null;

    default:
      return null;
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("contestTracker");
    const youtubeCollection = db.collection("youtube_links");

    const videoMappings = [];

    for (const [platform, playlistId] of Object.entries(PLAYLIST_IDS)) {
      if (!playlistId) continue;

      const playlistVideos = await fetchPlaylistVideos(playlistId);

      for (const video of playlistVideos) {
        const contestId = extractContestInfo(video.snippet.title, platform);
        if (contestId) {
          videoMappings.push({
            platform,
            contestId,
            youtubeUrl: `https://youtube.com/watch?v=${video.snippet.resourceId.videoId}`,
            title: video.snippet.title,
            updatedAt: new Date(),
          });
        }
      }
    }

    await Promise.all(
      videoMappings.map((mapping) =>
        youtubeCollection.updateOne(
          {
            platform: mapping.platform,
            contestId: mapping.contestId,
          },
          { $set: mapping },
          { upsert: true }
        )
      )
    );

    return NextResponse.json({ success: true, count: videoMappings.length });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 }
    );
  }
}
