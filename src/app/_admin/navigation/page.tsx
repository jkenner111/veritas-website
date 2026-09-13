import fs from "node:fs";
import path from "node:path";
import { NavigationEditor } from "./NavigationEditor";

export const dynamic = "force-dynamic";

function loadNavigation() {
  const navPath = path.join(process.cwd(), "content", "navigation.json");
  return JSON.parse(fs.readFileSync(navPath, "utf-8"));
}

export default function AdminNavigation() {
  const navigation = loadNavigation();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Navigation</h1>
      <p className="mt-1 text-sm text-gray-500">
        Top-level menu items shown in the site header. Edit and reorder.
      </p>
      <NavigationEditor initial={navigation} />
    </div>
  );
}
