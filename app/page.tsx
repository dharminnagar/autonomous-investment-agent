"use client"
import { useConnection } from "arweave-wallet-kit";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LandingPage } from "@/components/pages/LandingPage";
import { toast } from "sonner";
export default function Home() {
  const { connected } = useConnection();
  const router = useRouter();

  useEffect(() => {
    if (connected) {
      toast("dum dum says your wallet is connected!", {
        action: {
          label: "Go to Portfolio",
          onClick: () => router.push("/portfolio"),
        },
      });
    }
  }, [connected, router]);  

  return (
    <div>
      <LandingPage />
    </div>
  )
}
