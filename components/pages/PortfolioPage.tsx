"use client";
import { useActiveAddress, useConnection } from "arweave-wallet-kit";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mainProcessId } from "@/lib/config";
import { dryrunResult } from "@/lib/aoService";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tokens } from "@/lib/config";

type Investment = {
    Wallet_Address: string;
    iToken_Address: string;
    oToken_Address: string;
    numberOfTokens: number;
    Date: string;
    RecurringDay: number;
}

const InvestmentPlansDialog = ({ 
    open, 
    onOpenChange, 
    investments 
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    investments: Investment[];
}) => {
    const getNextInvestmentDate = (recurringDay: number) => {
        const today = new Date();
        const nextDate = new Date(today.getFullYear(), today.getMonth(), recurringDay);
        if (nextDate < today) {
            nextDate.setMonth(nextDate.getMonth() + 1);
        }
        return nextDate;
    };

    const getTokenSymbol = (address: string) => {
        return Object.values(Tokens).find(token => token.address === address)?.symbol || 'Unknown';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Investment Plans</DialogTitle>
                    <DialogDescription>
                        View all your active investment plans
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {investments.map((investment, index) => {
                        const nextDate = getNextInvestmentDate(investment.RecurringDay);
                        return (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                            <span className="text-white font-bold">$</span>
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {getTokenSymbol(investment.iToken_Address)} → {getTokenSymbol(investment.oToken_Address)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {investment.numberOfTokens} tokens
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">Next Investment</div>
                                    <div className="text-sm text-gray-500">
                                        {nextDate.toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const PortfolioPage = () => {
    const { connected } = useConnection();
    const address = useActiveAddress();
    const [loading, setLoading] = useState(false);
    const [totalInvested, setTotalInvested] = useState(0);
    const [totalReturns, setTotalReturns] = useState(0);
    const [activeInvestments, setActiveInvestments] = useState(0);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [nextInvestmentDate, setNextInvestmentDate] = useState<Date | null>(null);

    useEffect(() => {
        console.log("Connected", connected + ": " + address);
        const fetchData = async () => {
            setLoading(true);
            if (!connected || !address) {
                toast("dum dum requires your wallet to continue");
                setLoading(false);
                return;
            } else {
                toast("dum dum says your wallet is connected!");
            }
            
            // Fetch investment data from database
            const investmentData: Investment[] = await dryrunResult(mainProcessId, [
                { name: "Action", value: "getInvestmentPlans" },
                { name: "Wallet_Address", value: address },
            ]);

            setInvestments(investmentData);
            setTotalInvested(investmentData.reduce((acc: number, curr: Investment) => acc + curr.numberOfTokens, 0));
            setTotalReturns(investmentData.reduce((acc: number, curr: Investment) => acc + (curr.numberOfTokens - (curr.numberOfTokens * 0.90)), 0));
            setActiveInvestments(investmentData.length);

            // Calculate next investment date
            if (investmentData.length > 0) {
                const today = new Date();
                const nextDates = investmentData.map(inv => {
                    const nextDate = new Date(today.getFullYear(), today.getMonth(), inv.RecurringDay);
                    if (nextDate < today) {
                        nextDate.setMonth(nextDate.getMonth() + 1);
                    }
                    return nextDate;
                });
                const closestDate = nextDates.reduce((a, b) => a < b ? a : b);
                setNextInvestmentDate(closestDate);
            }

            console.log(investmentData);
            setLoading(false);
        };

        fetchData();
    }, [connected, address]);

    const LoadingSpinner = () => (
        <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center w-full h-[70vh]">
            <Card className="w-[58vw] h-[52vh] rounded-none bg-[white]/80 backdrop-blur-md border-gray-800">
                <CardContent className="p-6 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl mb-1">Portfolio Overview</CardTitle>
                            <CardDescription className="text-xl">
                                Your Investment Statistics
                            </CardDescription>
                        </div>
                        <Link href="/invest">
                            <Button className="flex items-center gap-2">
                                <PlusCircle className="h-4 w-4" />
                                New Investment
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500">Total Invested</h3>
                                <div className="flex items-baseline gap-2">
                                    {loading ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <>
                                            <span className="text-3xl font-bold">{totalInvested}</span>
                                            <span className="text-lg text-gray-600">AR</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500">Total Returns</h3>
                                <div className="flex items-baseline gap-2">
                                    {loading ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <>
                                            <span className="text-3xl font-bold text-green-600">+{totalReturns}</span>
                                            <span className="text-lg text-gray-600">AR</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500">Active Investments</h3>
                                <div className="flex items-baseline gap-2">
                                    {loading ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <>
                                            <span className="text-3xl font-bold">{activeInvestments}</span>
                                            <span className="text-lg text-gray-600">positions</span>
                                            <Button 
                                                variant="link" 
                                                className="text-sm text-black"
                                                onClick={() => setDialogOpen(true)}
                                            >
                                                View All
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500">Next Investment Date</h3>
                                <div className="text-3xl font-bold">
                                    {loading ? (
                                        <LoadingSpinner />
                                    ) : (
                                        nextInvestmentDate ? nextInvestmentDate.getDate() : '-'
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />
                    

                    {/* This is just for the current implementation, as the process is under development */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500">Recent Activity</h3>
                        <div className="space-y-2">
                            {loading ? (
                                <div className="flex justify-center py-4">
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                <div className="flex justify-between items-center py-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                            <span className="text-white font-bold">$</span>
                                        </div>
                                        <div>
                                            <div className="font-medium">STAR1 → STAR2</div>
                                            <div className="text-sm text-gray-500">Today</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">5 STAR1</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <InvestmentPlansDialog 
                open={dialogOpen} 
                onOpenChange={setDialogOpen} 
                investments={investments}
            />
        </div>
    );
};

export default PortfolioPage;