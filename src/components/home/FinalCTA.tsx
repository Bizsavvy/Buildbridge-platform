import * as React from "react"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function FinalCTA() {
  return (
    <section 
      className="py-24 overflow-hidden relative"
      style={{ 
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-tertiary) 100%)',
      }}
    >
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'white', filter: 'blur(40px)', transform: 'translateY(-50%) translateX(50%)' }} />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'white', filter: 'blur(40px)', transform: 'translateY(50%) translateX(-50%)' }} />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ color: 'white' }}>
            Ready to invest in skilled work?
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mb-10" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Join thousands of backers supporting Nigerian tradespeople. Whether you&apos;re at home or in the diaspora, your capital makes growth possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login">
              <Button 
                className="min-w-[200px] shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                style={{ background: 'white', color: 'var(--color-primary)' }}
              >
                Create an Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/browse">
              <Button 
                variant="ghost" 
                className="min-w-[200px]"
                style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', border: '2px solid' }}
              >
                Browse Active Needs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}