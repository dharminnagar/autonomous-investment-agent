"use client"
import { LandingPage } from "@/components/LandingPage";
import { useConnection } from "arweave-wallet-kit";

export default function Home() {
  const { connected } = useConnection();

  if(!connected) {
    return (<LandingPage />);
  }

  return (
    <div>
      Connected

    </div>
  );
}
