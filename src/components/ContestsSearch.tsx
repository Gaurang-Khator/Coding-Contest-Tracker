"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function ContestsSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setSearchValue(searchParams?.get("contest") || "");
  }, [searchParams]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    const params = new URLSearchParams(searchParams || "");
    if (value.trim()) {
      params.set("contest", value);
    } else {
      params.delete("contest");
    }
    router.push(`?${params.toString()}`);
  };

  const handleClear = () => {
    setSearchValue("");
    const params = new URLSearchParams(searchParams || "");
    params.delete("contest");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search contests by name, platform, or ID..."
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-10 h-11 bg-muted border-0 focus-visible:ring-2 focus-visible:ring-primary"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-9 w-9"
            onClick={handleClear}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
