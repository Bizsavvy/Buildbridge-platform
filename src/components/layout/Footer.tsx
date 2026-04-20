"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, ArrowRight } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Platform: [
      { name: "Browse Needs", href: "/browse" },
      { name: "Impact Stories", href: "/impact" },
      { name: "How It Works", href: "/how-it-works" },
      { name: "Log In", href: "/login" },
    ],
    Explore: [
      { name: "Discover Needs", href: "/browse" },
      { name: "Collaborate", href: "/partners" },
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/about" },
    ],
    Support: [
      { name: "Contact Us", href: "/contact" },
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
      { name: "Trust & Safety", href: "/trust" },
    ],
  };

  return (
    <footer className="w-full bg-primary text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden mt-0">
      {/* Decorative Ornaments */}
      <div className="absolute top-12 right-12 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 pb-16">

          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-8 pr-8">
            <Link href="/" className="flex items-center group cursor-pointer">
              <div className="relative h-6 w-[150px]">
                <Image
                  src="/buildbridge-logo-primary.svg"
                  alt="BuildBridge"
                  fill
                  className="object-contain brightness-0 invert"
                  priority
                />
              </div>
            </Link>
            <p className="text-white/70 text-base leading-relaxed max-w-sm font-medium">
              Join our weekly newsletter to get updates on funded artisans and new high-impact needs.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: Twitter, href: "https://twitter.com" },
                { icon: Facebook, href: "https://facebook.com" },
                { icon: Instagram, href: "https://instagram.com" },
              ].map((social, idx) => (
                <Link
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-300"
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="flex flex-col gap-6">
              <h3 className="font-black text-sm uppercase tracking-widest text-yellow-400">
                {title}
              </h3>
              <ul className="flex flex-col gap-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm font-bold opacity-80 hover:opacity-100 transition-opacity"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section - Unified integrated layout */}
        <div className="pt-16 pb-10 border-t border-white/20">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
            <div className="max-w-md text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                Stay Connected <br />
                with <span className="text-yellow-400 italic">Causes</span>
              </h2>
            </div>

            <div className="w-full max-w-md">
              <form className="relative group" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="w-full h-14 bg-white/10 border border-white/20 rounded-full px-8 pr-32 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-sm"
                  />
                  <button 
                    type="submit"
                    className="absolute right-1.5 top-1.5 h-11 px-6 rounded-full bg-yellow-400 text-black font-black text-xs uppercase tracking-widest hover:bg-yellow-300 active:scale-[0.98] transition-all shadow-lg whitespace-nowrap"
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">
            &copy; {currentYear} BuildBridge Impact Platform. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            {["Privacy", "Terms", "Support"].map((legal) => (
              <Link key={legal} href={`/${legal.toLowerCase()}`} className="text-[10px] font-bold text-white/40 hover:text-white/80 transition-colors uppercase tracking-[0.2em]">
                {legal}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}