# 🚀 Coding Contest Tracker

*Coding Contest Tracker* is a web-based application that helps competitive programmers stay up-to-date with upcoming, ongoing, and completed contests across multiple platforms such as *Codeforces*, *LeetCode*, and *CodeChef* — all in one dashboard.

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

---

## 🌐 API Endpoints

The app uses Next.js API routes to interact with contest data:

- GET /api/codeforces – Fetch contests from Codeforces
- GET /api/leetcode – Fetch contests from LeetCode
- GET /api/codechef – Fetch contests from CodeChef
- GET /api/contests – Fetch contests from all platforms
- POST /api/bookmark – Manage contest bookmarks

---

## 🧩 Type Definitions

```ts
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

# ✨ Feature Highlights

## 📂 Platform Filter  
Easily filter contests based on the source platform — choose from Codeforces, LeetCode, or CodeChef, or view all together.

## 🔍 Search Functionality  
Search for contests by name using a fast and intuitive search bar.

## 🟢 Contest Status  
Each contest is tagged with a status:  
- *Upcoming* – Not started yet  
- *Ongoing* – Currently running  
- *Completed* – Already ended

## 🔗 Quick Access  
Each contest includes a direct link to its original page on the respective platform.

## ⭐ Bookmarked Contests  
Users can bookmark their favorite or important contests for later reference.

## 🌗 Theme Toggle  
Choose between *Dark Mode* and *Light Mode* for a comfortable viewing experience.

## 📱 Responsive UI  
Works seamlessly across devices — mobile, tablet, and desktop.

## 🎨 Platform-Specific Styling  
Each platform is represented with its own color scheme and branding style for quick visual recognition.


# 🔮 Roadmap

Here are some features and improvements planned for future versions of the Contest Tracker:

## 🚧 In Development
- [ ] UI enhancements for mobile users
- [ ] Add countdown timer for each contest

## ✅ Coming Soon
- [ ] *Email Reminders*  
  Users will be able to subscribe and get notified of upcoming contests via email.

- [ ] *More Platforms Support*  
  Integration with other platforms like:
  - GeeksforGeeks (GFG)
  - AtCoder
  - HackerRank

- [ ] *User Authentication*  
  Enable login and signup so users can save preferences and bookmarks persistently.

- [ ] *Contest Reminders & Notifications*  
  Push and in-app notifications for upcoming contests a few hours before they begin.

- [ ] *User Dashboard*  
  Personal dashboard for tracking bookmarked and participated contests.

- [ ] *Analytics (Optional)*  
  Show stats like contest frequency, average duration, or weekly programming calendar.

---

✅ Have a feature request? [Open an issue](https://github.com/Gaurang-Khator/Coding-Contest-Tracker/issues) or contribute!
