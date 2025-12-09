import { Code2, Zap } from "lucide-react";

export default function Header() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
          <Code2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Contest Tracker
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Zap className="w-4 h-4" />
            Stay updated with coding contests
          </p>
        </div>
      </div>
    </div>
  );
}
