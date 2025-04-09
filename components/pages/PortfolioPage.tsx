"use client";
import { useConnection } from "arweave-wallet-kit";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const PortfolioPage = () => {
    const { connected } = useConnection();
    const [totalInvested, setTotalInvested] = useState(0);
    const [totalReturns, setTotalReturns] = useState(0);
    const [activeInvestments, setActiveInvestments] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (!connected) {
                toast("dum dum requires your wallet to continue");
                return;
            } else {
                toast("dum dum says your wallet is connected!");
            }
            // TODO: Fetch actual investment data here
        };

        fetchData();
    }, [connected]);

    return (
        <div className="flex flex-col items-center justify-center w-full h-[70vh]">
            <Card className="w-[58vw] h-[52vh] rounded-none bg-[white]/80 backdrop-blur-md border-gray-800">
                <CardContent className="p-6 space-y-6">
                    <div>
                        <CardTitle className="text-2xl mb-1">Portfolio Overview</CardTitle>
                        <CardDescription className="text-xl">
                            Your Investment Statistics
                        </CardDescription>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500">Total Invested</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">{totalInvested}</span>
                                    <span className="text-lg text-gray-600">AR</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500">Total Returns</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-green-600">+{totalReturns}</span>
                                    <span className="text-lg text-gray-600">AR</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500">Active Investments</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">{activeInvestments}</span>
                                    <span className="text-lg text-gray-600">positions</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500">Next Investment Date</h3>
                                <div className="text-3xl font-bold">
                                    {new Date().getDate()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500">Recent Activity</h3>
                        <div className="space-y-2">
                            {/* Placeholder for recent transactions */}
                            <div className="flex justify-between items-center py-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                        <span className="text-white font-bold">$</span>
                                    </div>
                                    <div>
                                        <div className="font-medium">AR → AO</div>
                                        <div className="text-sm text-gray-500">Today</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">0.5 AR</div>
                                    <div className="text-sm text-gray-500">Pending</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PortfolioPage;