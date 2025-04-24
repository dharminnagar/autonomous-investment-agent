import dynamic from "next/dynamic";

const ArbitragePage = dynamic(() => import("@/components/pages/ArbitragePage"), { ssr: false });

export default function Arbitrage() {
    return (
        <div>
            <ArbitragePage />
        </div>
    )
} 