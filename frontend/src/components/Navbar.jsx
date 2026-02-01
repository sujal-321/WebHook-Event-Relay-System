import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

export default function Navbar({ current, onChange }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex justify-between items-center border-b p-4">
      <div className="flex gap-2">
        {["dashboard", "webhooks", "logs"].map((page) => (
          <Button
            key={page}
            variant={current === page ? "default" : "outline"}
            onClick={() => onChange(page)}
          >
            {page.toUpperCase()}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </Button>
    </div>
  );
}
