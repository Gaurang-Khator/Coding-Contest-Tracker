"use client";
import { useCallback, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ContestsSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputVal, setInputVal] = useState(searchParams.get("contest") || "");

  const createQueryString = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const platform = params.get("platform");

      const newParams = new URLSearchParams();

      if (platform) {
        newParams.set("platform", platform);
      }

      if (value) {
        newParams.set("contest", value);
      }

      return newParams.toString();
    },
    [searchParams]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputVal(value);
    const queryString = createQueryString(value);
    const url = queryString ? `/?${queryString}` : "/";
    router.replace(url);
  };

  useEffect(() => {
    const contest = searchParams.get("contest");
    if (contest) {
      setInputVal(contest);
    }
  }, [searchParams]);

  return (
    <div className="relative w-full max-w-md mx-auto mb-8 px-4">
      <div className="absolute inset-y-0 left-4 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="text"
        placeholder="Search contests..."
        className="pl-10"
        value={inputVal}
        onChange={handleChange}
      />
    </div>
  );
}
