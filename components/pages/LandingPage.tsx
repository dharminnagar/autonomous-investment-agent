"use client";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import Image from "next/image";
import { useEffect } from "react";
import { useConnection } from "arweave-wallet-kit";
import { toast } from "sonner";
export const LandingPage = () => {
    const { connected } = useConnection();

    useEffect(() => {
        if (connected) {
            toast("please wait while we connect to your wallet")
        }
    }, [connected])

    return (
        <div className="flex flex-col items-center justify-center h-[70vh]">
            <Card className="flex flex-col items-center justify-center h-[52vh] w-[58vw] bg-[white]/80 backdrop-blur-md border-gray-800 rounded-none">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <div className="mb-4 relative w-36 h-36 mx-auto select-none">
                        <Image
                            src="/dum_dum.png"
                            alt="Dum Dum"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-4xl font-bold text-black mb-4 select-none">Portfolio not dum dum(ing)?</h1>
                    <h1 className="text-4xl font-bold text-black mb-4 select-none">You&apos;ve landed on the right place!</h1>
                    <p className="text-gray-400">
                        Please connect your Arweave wallet to start investing
                    </p>
                </motion.div>
            </Card>
        </div>
    );
};
