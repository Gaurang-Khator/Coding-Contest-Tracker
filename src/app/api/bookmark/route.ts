import { Contest } from "@/app/types/contest";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const getBookmarks = async (): Promise<Contest[]> => {
  try {
    const cookieStore = await cookies();
    const bookmarksStr = cookieStore.get("bookmarks")?.value;
    return bookmarksStr ? JSON.parse(bookmarksStr) : [];
  } catch (error) {
    console.error("Error getting bookmarks:", error);
    return [];
  }
};

const saveBookmarks = async (bookmarks: Contest[]) => {
  try {
    const cookieStore = await cookies();
    cookieStore.set("bookmarks", JSON.stringify(bookmarks));
  } catch (error) {
    console.error("Error saving bookmarks:", error);
  }
};

export async function DELETE(req: NextRequest) {
  const contest: Contest = await req.json();
  const bookmarks = await getBookmarks();
  const updatedBookmarks = bookmarks.filter(
    (bookmark) => bookmark.id !== contest.id
  );
  saveBookmarks(updatedBookmarks);
  return NextResponse.json({ message: "Contest removed from bookmarks" });
}

export async function POST(req: NextRequest) {
  const contest: Contest = await req.json();
  const bookmarks = await getBookmarks();
  const isAlreadyBookmarked = bookmarks.some(
    (bookmark) => bookmark.id === contest.id
  );

  if (!isAlreadyBookmarked) {
    bookmarks.push(contest);
    saveBookmarks(bookmarks);
    return NextResponse.json({ message: "Contest bookmarked successfully" });
  }

  return NextResponse.json({ message: "Contest already bookmarked" });
}

export async function GET() {
  const bookmarks = await getBookmarks();
  return NextResponse.json(bookmarks);
}
