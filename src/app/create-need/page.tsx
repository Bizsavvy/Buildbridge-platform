import { Metadata } from "next"
import { Suspense } from "react"
import NeedCreationFlow from "@/components/need-creation/NeedCreationFlow"

export const metadata: Metadata = {
  title: "Create a Need | BuildBridge",
  description: "Start raising funds for your trade equipment or service.",
}

export default function CreateNeedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NeedCreationFlow />
    </Suspense>
  )
}