import dynamic from "next/dynamic";

const PortfolioPage = dynamic(() => import("@/components/pages/PortfolioPage"), { ssr: false });

export default function Portfolio() {
    return (
        <div>
            <PortfolioPage />
        </div>
    )
}