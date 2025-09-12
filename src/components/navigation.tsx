import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gamepad2, Menu, User } from "lucide-react";

export function Navigation() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              GameHub
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/games" className="text-sm font-medium hover:text-primary transition-colors">
              All Games
            </Link>
            <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
              Categories
            </Link>
            <Link href="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">
              Leaderboard
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4 mr-2" />
              Play as Guest
            </Button>
            <Button size="sm">
              Sign Up
            </Button>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}