import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Moon,
  Sun,
  Search,
  Home,
  BookOpen,
  MessageSquare,
  Mail,
  LogIn,
  LogOut,
  User as UserIcon,
  Clock,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

type RecentScan = {
  id: string;
  is_phishing: boolean;
  confidence: number;
  email_content: string;
  created_at: string;
};

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);

  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/detector", label: "Detector", icon: Search },
    { to: "/forum", label: "Forum", icon: MessageSquare },
    { to: "/examples", label: "Examples", icon: BookOpen },
  ];

  useEffect(() => {
    if (!user) {
      setRecentScans([]);
      return;
    }
    supabase
      .from("phishing_scans")
      .select("id,is_phishing,confidence,email_content,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setRecentScans(data as RecentScan[]);
      });
  }, [user, location.pathname]);

  const goToContact = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } else {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initial = (profile?.display_name || user?.email || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <img
            src={logo}
            alt="Phishing Defense logo"
            className="h-10 w-10 rounded-lg object-contain shadow-lg"
          />
          <span className="hidden sm:inline bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Phishing Defense
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.to === location.pathname;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={goToContact}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
            )}
          >
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Contact</span>
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 ml-1 px-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {initial}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
                    {profile?.display_name ?? user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">
                    {profile?.display_name ?? "User"}
                  </span>
                  <span className="text-xs text-muted-foreground font-normal truncate">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Recent Scans
                </DropdownMenuLabel>
                {recentScans.length === 0 ? (
                  <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                    No scans yet — try the Detector.
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {recentScans.map((scan) => (
                      <DropdownMenuItem
                        key={scan.id}
                        onClick={() => navigate("/detector")}
                        className="flex flex-col items-start gap-1 py-2"
                      >
                        <div className="flex items-center gap-2 w-full">
                          {scan.is_phishing ? (
                            <ShieldAlert className="h-3.5 w-3.5 text-destructive shrink-0" />
                          ) : (
                            <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" />
                          )}
                          <Badge
                            variant={scan.is_phishing ? "destructive" : "success"}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {scan.is_phishing ? "PHISHING" : "SAFE"}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {scan.confidence}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 w-full">
                          {scan.email_content.substring(0, 60)}
                        </p>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/detector")}>
                  <Search className="h-4 w-4" />
                  Open Detector
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="hero"
              size="sm"
              onClick={() => navigate("/login")}
              className="ml-1"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="ml-1"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
};
