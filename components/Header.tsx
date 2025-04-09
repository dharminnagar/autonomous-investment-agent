import { ConnectButton } from "arweave-wallet-kit";
import Link from "next/link";

export const Header = () => {

    return (
        <div className="flex items-center justify-between p-4 h-[10vh] border-2 border-black">
            <div className="flex items-center gap-4">
                <Link href="/" className="text-4xl font-bold">
                    Invest<span className="underline">Ar</span>
                </Link>
                <div className="flex items-center gap-4 text-sm text-black">
                    {/* TODO: Add Straight line for divider */}
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
                </div>
            </div>
            <ConnectButton />
        </div>
    );
};
