# 🚀 Coding Contest Tracker

*Coding Contest Tracker* is a web-based application that helps competitive programmers stay up-to-date with upcoming, ongoing, and completed contests across multiple platforms such as *Codeforces, **LeetCode, and **CodeChef* — all in one dashboard.

---

## 📌 Features

- 🔄 Real-time contest updates from APIs
- 🗂 Filter contests by platform
- 🔍 Search contests by name
- 🟢 Status indicators: Upcoming, Ongoing, Completed
- 🎨 Clean and responsive UI with platform-specific themes
- 🌗 Toggle between Light and Dark modes
- ⭐ Bookmark your favorite contests
- 🔗 Direct links to contest detail pages

---

## 🛠 Tech Stack

| Category       | Tech Used                       |
|----------------|----------------------------------|
| Frontend       | [Next.js](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/) |
| UI Components  | [Shadcn UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/) |
| Backend/API    | Next.js API routes              |
| Database       | [MongoDB](https://www.mongodb.com/) |
| Validation     | [Zod](https://zod.dev/)         |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── bookmark/
│   │   ├── codechef/
│   │   ├── codeforces/
│   │   ├── contests/
│   │   ├── leetcode/
│   ├── form/
│   ├── types/
│   └── page.tsx
├── components/
│   ├── ui/
│   └── ...
└── lib/ # Utility functions
```

## API Routes

The application includes API routes for fetching and managing data:

- `/api/codeforces` - Fetches contests from Codeforces
- `/api/leetcode` - Fetches contests from LeetCode
- `/api/codechef` - Fetches contests from CodeChef
- `/api/contests` - Fetches contests from all platforms
- `/api/bookmark` - Manages bookmarked contests

## Types

The application uses TypeScript for type safety. Key types include:

```typescript
interface Contest {
  id: string | number;
  name: string;
  platform: string;
  startTime: string;
  duration: string;
  status: string;
  href: string;
}

interface CodeForcesContests {
  id: number;
  name: string;
  phase: string;
  startTimeSeconds: number;
  durationSeconds: number;
}

interface CodeChefContest {
  contest_code: string;
  contest_name: string;
  contest_start_date_iso: string;
  contest_duration: string;
}


type Theme = "dark" | "light";

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

interface FormValues {
  youtubeUrl: string;
  contestId: string;
}
```

## Features in Detail

### Contest Filtering
Filter contests by platform (Codeforces, LeetCode, CodeChef) or view all contests at once.

### Bookmarks
Save your favorite contests for quick access.

### Dark/Light Mode
Toggle between dark and light themes based on your preference.

## Future Integrations 
- Scheduled Emails for contests
- Support for other platforms like GFG, AtCoder
- User authentication and profiles
- Contest reminders and notifications
