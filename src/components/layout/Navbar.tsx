"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, Hammer, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MobileNav } from "./MobileNav"
import { useDemoAuth } from "@/contexts/DemoAuthContext"
import { useRouter } from "next/navigation"

export function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { isAuthenticated, signOut, demoUser } = useDemoAuth();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Top Announcement Bar */}
      <div className="w-full bg-primary text-on-primary py-2 px-4 text-center">
        <p className="text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-2">
          <span className="opacity-80">📣</span>
          BuildBridge: The #1 Direct Impact Platform for Nigeria's Artisans
          <Link href="/browse" className="underline hover:opacity-80 transition-opacity ml-1">
            Back a Trade Today →
          </Link>
        </p>
      </div>

      <header
        className={`w-full transition-all duration-300 border-b border-transparent ${
          isScrolled 
            ? "bg-white/90 backdrop-blur-md shadow-sm border-white/20 py-3" 
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center group cursor-pointer">
            <div className="relative h-8 w-[222.666px]">
              <Image
                src="/buildbridge-logo-primary.svg"
                alt="BuildBridge"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Centered Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {[
              { name: "Browse Needs", href: "/browse" },
              { name: "How It Works", href: "/how-it-works" },
              { name: "Impact Wall", href: "/impact" },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-bold tracking-wide transition-all duration-300 hover:scale-105 cursor-pointer ${
                  isScrolled ? 'text-on-surface-variant hover:text-primary' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`hidden sm:flex group cursor-pointer text-sm font-black items-center gap-2 transition-colors duration-300 ${isScrolled ? 'text-on-surface-variant hover:text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  <User className="h-4 w-4" />
                  {demoUser?.name?.split(' ')[0] || "Dashboard"}
                </Link>
                
                <button
                  onClick={() => {
                    signOut();
                    router.push("/");
                  }}
                  className={`hidden sm:flex h-11 px-6 rounded-full font-extrabold text-xs transition-all items-center justify-center gap-2 hover:bg-error/5 hover:text-error border border-outline-variant/50 ${
                    isScrolled ? 'text-on-surface-variant' : 'text-on-surface-variant'
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={`hidden sm:flex group cursor-pointer text-sm font-bold transition-colors duration-300 ${isScrolled ? 'text-on-surface-variant hover:text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                  Log In
                </Link>
                
                <Link 
                  href="/onboarding" 
                  className={`hidden sm:flex h-11 px-7 rounded-full font-extrabold text-sm transition-all items-center justify-center hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/10 ${
                    isScrolled ? 'bg-primary text-white' : 'bg-primary text-white'
                  }`}
                >
                  Get Started
                </Link>
              </>
            )}

            <button 
              className={`md:hidden p-2 transition-colors cursor-pointer ${isScrolled ? 'text-on-surface-variant' : 'text-on-surface'}`}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>
    </div>

      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}