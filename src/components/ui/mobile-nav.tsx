"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Home, 
  Gamepad2, 
  Trophy, 
  Star, 
  User, 
  Search,
  X,
  Play,
  Target
} from "lucide-react";
import Image from "next/image";

interface MobileNavProps {
  user?: {
    username: string;
    avatar?: string;
    level: number;
  } | null;
}

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { 
      href: "/", 
      label: "Home", 
      icon: Home,
      description: "Browse featured games"
    },
    { 
      href: "/games", 
      label: "Games", 
      icon: Gamepad2,
      description: "All games library",
      badge: "219"
    },
    { 
      href: "/leaderboards", 
      label: "Leaderboards", 
      icon: Trophy,
      description: "Global rankings"
    },
    { 
      href: "/achievements", 
      label: "Achievements", 
      icon: Star,
      description: "Unlock badges & rewards"
    }
  ];

  const quickActions = [
    { 
      href: "/games?featured=true", 
      label: "Featured Games", 
      icon: Star,
      color: "bg-yellow-500"
    },
    { 
      href: "/games?sort=popular", 
      label: "Most Popular", 
      icon: Trophy,
      color: "bg-orange-500"
    },
    { 
      href: "/games?category=puzzle", 
      label: "Puzzle Games", 
      icon: Target,
      color: "bg-purple-500"
    },
    { 
      href: "/games?new=true", 
      label: "New Releases", 
      icon: Play,
      color: "bg-green-500"
    }
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src="/generated/logo.png"
                  alt="GameHub"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <SheetTitle className="font-heading text-lg">GameHub</SheetTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {user && (
              <div className="flex items-center gap-3 mt-4 p-3 bg-white/50 rounded-lg">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{user.username}</p>
                  <Badge variant="secondary" className="text-xs">
                    Level {user.level}
                  </Badge>
                </div>
              </div>
            )}
          </SheetHeader>

          {/* Navigation */}
          <div className="flex-1 overflow-auto py-6">
            <div className="px-6">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
                Navigation
              </h3>
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                        active 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <IconComponent className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="px-6 mt-8">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const IconComponent = action.icon;
                  
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      onClick={() => setOpen(false)}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-center leading-tight">
                        {action.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Search */}
            <div className="px-6 mt-8">
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => {
                  setOpen(false);
                  // Focus search input if on games page
                  setTimeout(() => {
                    const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
                    if (searchInput) searchInput.focus();
                  }, 100);
                }}
              >
                <Search className="h-4 w-4" />
                Search games...
              </Button>
            </div>

            {/* User Actions */}
            {!user && (
              <div className="px-6 mt-8">
                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/auth/login" onClick={() => setOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/auth/register" onClick={() => setOpen(false)}>
                      Create Account
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {user && (
              <div className="px-6 mt-8">
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile Settings
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => setOpen(false)}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-muted/20">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                GameHub © 2024
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Play. Compete. Achieve.
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}