"use client";
import { useActiveAddress, useConnection } from "arweave-wallet-kit";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mainProcessId } from "@/lib/config";
import { dryrunResult, messageResult } from "@/lib/aoService";
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
    ID: number;
    Wallet_Address: string;
    InputTokenAddress: string;
    OutputTokenAddress: string;
    Amount: number;
    Date: string;
    RecurringDay: number;
    Active?: boolean;
}

const InvestmentPlansDialog = ({ 
    open, 
    onOpenChange, 
    investments,
    onCancelInvestment,
    cancelLoading
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    investments: Investment[];
    onCancelInvestment: (id: number) => Promise<void>;
    cancelLoading: number | null;
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
                        // Convert to number for consistent comparison
                        const activeValue = investment.Active === true ? 1 : Number(investment.Active || 0);
                        const isCancelled = activeValue !== 1;
                        
                        return (
                            <div key={index} className={`flex items-center justify-between p-4 border rounded-lg ${isCancelled ? 'bg-gray-100' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full ${isCancelled ? 'bg-gray-400' : 'bg-blue-500'} flex items-center justify-center`}>
                                            <span className="text-white font-bold">$</span>
                                        </div>
                                        <div>
                                            <div className="font-medium flex items-center gap-2">
                                                {getTokenSymbol(investment.InputTokenAddress)} → {getTokenSymbol(investment.OutputTokenAddress)}
                                                {isCancelled && (
                                                    <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                                                        Cancelled
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {Number(investment.Amount || 0).toFixed(2)} tokens
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                ID: {investment.ID}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="text-right">
                                        <div className="font-medium">Next Investment</div>
                                        <div className="text-sm text-gray-500">
                                            {isCancelled ? 'N/A' : nextDate.toLocaleDateString()}
                                        </div>
                                    </div>
                                    {!isCancelled && (
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => onCancelInvestment(investment.ID)}
                                            disabled={cancelLoading === investment.ID}
                                        >
                                            {cancelLoading === investment.ID ? (
                                                <>
                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                    Cancelling...
                                                </>
                                            ) : (
                                                'Cancel'
                                            )}
                                        </Button>
                                    )}
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
    const [totalInvested, setTotalInvested] = useState<string>("0.00");
    const [totalReturns, setTotalReturns] = useState<string>("0.00");
    const [activeInvestments, setActiveInvestments] = useState(0);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [nextInvestmentDate, setNextInvestmentDate] = useState<Date | null>(null);
    const [cancelLoading, setCancelLoading] = useState<number | null>(null);

    const fetchData = async () => {
        setLoading(true);
        if(!connected || !address) {
            toast("dum dum requires your wallet to continue");
            return;
        }
        // Fetch investment data from database
        const investmentData: Investment[] = await dryrunResult(mainProcessId, [
            { name: "Action", value: "getInvestmentPlans" },
            { name: "Wallet_Address", value: address },
        ]);

        console.log(investmentData);

        setInvestments(investmentData);
        setTotalInvested(investmentData.reduce((acc: number, curr: Investment) => acc + Number(curr.Amount || 0), 0).toFixed(2));
        setTotalReturns(investmentData.reduce((acc: number, curr: Investment) => acc + (Number(curr.Amount || 0) - (Number(curr.Amount || 0) * 0.90)), 0).toFixed(2));
        // Count only active investments
        const activeCount = investmentData.filter(inv => {
            const activeValue = inv.Active === true ? 1 : Number(inv.Active || 0);
            return activeValue === 1;
        }).length;
        setActiveInvestments(activeCount);

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
    
    useEffect(() => {
        console.log("Connected", connected + ": " + address);
        if (!connected || !address) {
            toast("dum dum requires your wallet to continue");
            return;
        } else {
            toast("dum dum says your wallet is connected!");
        }

        fetchData();
    }, [connected, address]);

    const handleCancelInvestment = async (id: number) => {
        try {
            setCancelLoading(id);
            // Call the CancelInvestment handler

            console.log("Cancelling investment", id);
            const result = await messageResult(mainProcessId, [
                { name: "Action", value: "CancelInvestment" },
                { name: "InvestmentID", value: id.toString() },
            ]);

            console.log(result);
            
            // Update local state immediately to show cancelled
            setInvestments(prevInvestments => 
                prevInvestments.map(inv => 
                    inv.ID === id ? { ...inv, Active: false } : inv
                )
            );
            
            toast.success("Investment plan cancelled successfully!");
            // Refresh data after cancellation to ensure consistency
            await fetchData();
        } catch (error) {
            console.error("Error cancelling investment:", error);
            toast.error("Failed to cancel investment plan");
        } finally {
            setCancelLoading(null);
        }
    };

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
                        {/* <div className="space-y-2">
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
                                        <div className="font-medium">5.00 STAR1</div>
                                    </div>
                                </div>
                            )}
                        </div> */}
                    </div>
                </CardContent>
            </Card>

            <InvestmentPlansDialog 
                open={dialogOpen} 
                onOpenChange={setDialogOpen} 
                investments={investments}
                onCancelInvestment={handleCancelInvestment}
                cancelLoading={cancelLoading}
            />
        </div>
    );
};

export default PortfolioPage;