import { GitHubIconDark } from "@/lib/icons";
import { ConnectButton } from "arweave-wallet-kit";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export const Header = () => {
    return (
        <div className="flex items-center justify-between p-4 h-[10vh] border-2 border-black">
            <div className="flex items-center gap-4">
                <Link href="/" className="text-4xl font-bold">
                    Inve<span className="text-red-600">st<span className="underline decoration-black">Ar</span></span>
                </Link>
                <div className="flex items-center gap-4 text-sm text-black">
                    <div className="h-6 w-0.5 bg-black" />
                    <Link
                        href="/portfolio"
                        className="text-lg hover:underline hover:underline-offset-4 hover:decoration-2"
                    >
                        Portfolio
                    </Link>
                    <Link
                        href="/invest"
                        className="text-lg hover:underline hover:underline-offset-4 hover:decoration-2"
                    >
                        Invest
                    </Link>
                    <Link
                        href="/mint"
                        className="text-lg hover:underline hover:underline-offset-4 hover:decoration-2"
                    >
                        Mint
                    </Link>
                    <Link
                        href="/about"
                        className="text-lg hover:underline hover:underline-offset-4 hover:decoration-2"
                    >
                        About
                    </Link>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <a
                                href="https://github.com/dharminnagar/autonomous-investment-agent"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <GitHubIconDark size={36} />
                            </a>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>View the code on GitHub</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <ConnectButton />
            </div>
        </div>
    );
};
