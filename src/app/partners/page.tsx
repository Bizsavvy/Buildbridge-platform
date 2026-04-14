import React from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Hammer } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Page() {
  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center">
      <div className="w-full max-w-lg">
        <EmptyState 
          icon={Hammer}
          title="Building this section"
          description="We are currently laying the foundation for this page. Check back soon for updates."
          actionLabel="Return Home"
        />
        {/* We add a manual Link button to avoid needing to pass useRouter down for server components */}
        <div className="flex justify-center mt-4">
          <Link href="/">
            <Button variant="ghost">Go back home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
