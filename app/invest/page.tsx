import dynamic from "next/dynamic";

const InvestmentPage = dynamic(() => import("@/components/pages/InvestmentPage"), { ssr: false });

export default function Invest() {
    return (
        <div>
            <InvestmentPage />
        </div>
    )
}   