import dynamic from "next/dynamic";

const AboutPage = dynamic(() => import("@/components/pages/AboutPage"), { ssr: false });

export default function About() {
    return (
        <div>
            <AboutPage />
        </div>
    )
}