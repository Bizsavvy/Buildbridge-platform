import * as React from "react"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function FinalCTA() {
  return (
    <section className="py-24 bg-primary overflow-hidden relative">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-display-small md:text-display-medium font-black text-white mb-6">
            Ready to help build the future?
          </h2>
          <p className="text-body-large text-white/80 max-w-2xl mb-10">
            Join thousands of backers investing directly in African skilled trades. Whether you’re at home or in the diaspora, your capital makes growth possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login">
              <Button className="bg-white text-primary hover:bg-white/90 min-w-[200px]">
                Create an Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/browse">
              <Button variant="ghost" className="text-white hover:bg-white/10 border border-white/20 min-w-[200px]">
                Explore Active Needs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
