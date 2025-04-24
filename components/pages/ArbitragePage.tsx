"use client";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useConnection, useActiveAddress } from "arweave-wallet-kit";
import { toast } from "sonner";
import { mainProcessId, Tokens } from "@/lib/config";
import { dryrunResult, messageResult } from "@/lib/aoService";
import { Loader2 } from "lucide-react";

export const ArbitragePage = () => {
    const { connected } = useConnection();
    const address = useActiveAddress();
    const [maxAllowance, setMaxAllowance] = useState(0);
    const [selectedToken, setSelectedToken] = useState(Tokens.STAR1.address);
    const [slippageTolerance, setSlippageTolerance] = useState("0.3");
    const [isLoading, setIsLoading] = useState(false);
    const [userPid, setUserPid] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!connected) {
            toast("dum dum requires your wallet to continue");
        } else {
            toast("dum dum says your wallet is connected!");
        }
    }, [connected]);

    useEffect(() => {
        const fetchProcessId = async () => {
            const res = await dryrunResult(mainProcessId, [
                { name: "Action", value: "getUser" },
                { name: "Wallet_Address", value: address! },
            ]);
            setUserPid(res[0].Process_ID);
        };

        fetchProcessId();
    }, [address]);

    async function handleStartArbitrage() {
        if (!connected || !address) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (maxAllowance <= 0) {
            toast.error("Please enter a valid allowance amount");
            return;
        }

        setIsLoading(true);
        try {
            // Sample API call to start arbitrage process
            const res = await messageResult(mainProcessId, [
                { name: "Action", value: "StartArbitrage" },
                { name: "Wallet_Address", value: address },
                { name: "TokenAddress", value: selectedToken },
                { name: "MaxAllowance", value: maxAllowance.toString() },
                { name: "SlippageTolerance", value: slippageTolerance },
                { name: "PERSON_PID", value: userPid! },
            ]);

            if (res.Messages?.[0]?.Tags?.Result === "success") {
                toast.success("Arbitrage bot started successfully!");
            } else {
                toast.error("Failed to start arbitrage bot");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while starting the arbitrage bot");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-[70vh]">
            <Card className="w-[58vw] h-[52vh] rounded-none bg-[white]/80 backdrop-blur-md border-gray-800">
                <CardContent className="p-6 space-y-6">
                    <div>
                        <CardTitle className="text-2xl mb-1">Arbitrage Bot</CardTitle>
                        <CardDescription className="text-xl">
                            Set up your automated arbitrage strategy
                        </CardDescription>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">
                                Select Token
                            </label>
                            <Select value={selectedToken} onValueChange={setSelectedToken}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Token">
                                        {selectedToken && (
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-6 h-6 rounded-full ${
                                                        selectedToken === Tokens.STAR1.address
                                                            ? "bg-blue-500"
                                                            : selectedToken === Tokens.STAR2.address
                                                            ? "bg-purple-500"
                                                            : "bg-gray-500"
                                                    } flex items-center justify-center`}
                                                >
                                                    <span className="text-white font-bold text-sm">
                                                        {selectedToken === Tokens.STAR1.address
                                                            ? "$"
                                                            : selectedToken === Tokens.STAR2.address
                                                            ? "A"
                                                            : "T"}
                                                    </span>
                                                </div>
                                                {
                                                    Object.values(Tokens).find(
                                                        (token) => token.address === selectedToken
                                                    )?.symbol
                                                }
                                            </div>
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(Tokens).map((token) => (
                                        <SelectItem key={token.address} value={token.address}>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-6 h-6 rounded-full ${
                                                    token.symbol === "STAR1" ? "bg-blue-500" :
                                                    token.symbol === "STAR2" ? "bg-purple-500" : "bg-gray-500"
                                                } flex items-center justify-center`}>
                                                    <span className="text-white font-bold text-sm">
                                                        {token.symbol === "STAR1" ? "$" :
                                                        token.symbol === "STAR2" ? "A" : "T"}
                                                    </span>
                                                </div>
                                                {token.symbol}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">
                                Maximum Allowance
                            </label>
                            <Input
                                type="number"
                                placeholder="Enter maximum allowance amount"
                                className="w-full text-lg h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={maxAllowance || ""}
                                onChange={(e) => setMaxAllowance(parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">
                                Slippage Tolerance
                            </label>
                            <Select value={slippageTolerance} onValueChange={setSlippageTolerance}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select slippage tolerance" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0.1">0.1%</SelectItem>
                                    <SelectItem value="0.3">0.3%</SelectItem>
                                    <SelectItem value="0.5">0.5%</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator />

                        <Button
                            className="w-full h-12 text-lg"
                            size="lg"
                            onClick={handleStartArbitrage}
                            disabled={isLoading || !connected}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Starting Bot...
                                </div>
                            ) : (
                                "Start Arbitrage Bot"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ArbitragePage; 