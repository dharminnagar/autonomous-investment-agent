import dynamic from "next/dynamic";

const MintPage = dynamic(() => import("@/components/pages/MintPage"), { ssr: false });

export default function Mint() {
    return (
        <MintPage />
    )
}