"use client"

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ToggleTheme() {
  const { theme, setTheme } = useTheme();

  return (
    <button 
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
}
