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
import { Tokens } from "@/lib/config";
import { dryrunResult, messageResult } from "@/lib/aoService";
import { Loader2 } from "lucide-react";

// The Arbitrage Agent Process ID
// TODO: This should be moved to a config file
const ARBITRAGE_AGENT_PID = "_jmonJXkCMYUL-Es7gRWJ7FfJtNW_8itCKRIQ89IXLs";

export const ArbitragePage = () => {
    const { connected } = useConnection();
    const address = useActiveAddress();
    const [maxAllowance, setMaxAllowance] = useState(0);
    const [selectedInputToken, setSelectedInputToken] = useState(Tokens.STAR1.address);
    const [selectedTargetToken, setSelectedTargetToken] = useState(Tokens.STAR2.address);
    const [slippageTolerance, setSlippageTolerance] = useState("0.3");
    const [isLoading, setIsLoading] = useState(false);
    const [botRunning, setBotRunning] = useState(false);
    const [stopLoading, setStopLoading] = useState(false);

    useEffect(() => {
        if (!connected) {
            toast("dum dum requires your wallet to continue");
        } else {
            toast("dum dum says your wallet is connected!");
        }
    }, [connected]);

    // TODO: Will have to add this Handler to the process
    // Check if arbitrage bot is running on component mount
    useEffect(() => {
        const checkBotStatus = async () => {
            if (!connected || !address) return;
            
            try {
                const res = await dryrunResult(ARBITRAGE_AGENT_PID, [
                    { name: "Action", value: "Status" },
                ]);
                
                if (res && res.Enabled === true) {
                    setBotRunning(true);
                } else {
                    setBotRunning(false);
                }
            } catch (error) {
                console.error("Error checking bot status:", error);
                setBotRunning(false);
            }
        };
        
        checkBotStatus();
    }, [connected, address]);

    async function handleStartArbitrage() {
        if (!connected || !address) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (maxAllowance <= 0) {
            toast.error("Please enter a valid allowance amount");
            return;
        }

        if (selectedInputToken === selectedTargetToken) {
            toast.error("Input and target tokens must be different");
            return;
        }

        setIsLoading(true);
        try {
            // Step 1: Setup the arbitrage agent with user inputs
            const setupRes = await messageResult(ARBITRAGE_AGENT_PID, [
                { name: "Action", value: "Setup" },
                { name: "InputToken", value: selectedInputToken },
                { name: "TargetToken", value: selectedTargetToken },
                { name: "Slippage", value: slippageTolerance },
                { name: "InputTokenAmount", value: maxAllowance.toString() },
                { name: "OriginalSender", value: address }
            ]);

            if (setupRes.Error) {
                throw new Error("Setup failed: " + setupRes.Error);
            }
            
            toast.success("Arbitrage bot setup complete!");
            
            // Step 2: Add DEX processes (assuming they're already configured in the agent)
            // This step would be here if DEXes needed to be manually added
            
            // Step 3: Start the arbitrage bot
            const startRes = await messageResult(ARBITRAGE_AGENT_PID, [
                { name: "Action", value: "Start" },
            ]);

            if (startRes.Error) {
                throw new Error("Failed to start bot: " + startRes.Error);
            }
            
            toast.success("Arbitrage bot started successfully!");
            setBotRunning(true);
            
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "An error occurred while starting the arbitrage bot");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleStopArbitrage() {
        if (!connected || !address) {
            toast.error("Please connect your wallet first");
            return;
        }

        setStopLoading(true);
        try {
            const res = await messageResult(ARBITRAGE_AGENT_PID, [
                { name: "Action", value: "Stop" },
            ]);

            if (res.Error) {
                throw new Error("Failed to stop bot: " + res.Error);
            }
            
            toast.success("Arbitrage bot stopped successfully");
            setBotRunning(false);
            
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "An error occurred while stopping the arbitrage bot");
        } finally {
            setStopLoading(false);
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500">
                                    Select Input Token
                                </label>
                                <Select 
                                    value={selectedInputToken} 
                                    onValueChange={setSelectedInputToken}
                                    disabled={botRunning}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Input Token">
                                            {selectedInputToken && (
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`w-6 h-6 rounded-full ${
                                                            selectedInputToken === Tokens.STAR1.address
                                                                ? "bg-blue-500"
                                                                : selectedInputToken === Tokens.STAR2.address
                                                                ? "bg-purple-500"
                                                                : "bg-gray-500"
                                                        } flex items-center justify-center`}
                                                    >
                                                        <span className="text-white font-bold text-sm">
                                                            {selectedInputToken === Tokens.STAR1.address
                                                                ? "$"
                                                                : selectedInputToken === Tokens.STAR2.address
                                                                ? "A"
                                                                : "T"}
                                                        </span>
                                                    </div>
                                                    {
                                                        Object.values(Tokens).find(
                                                            (token) => token.address === selectedInputToken
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
                                    Select Target Token
                                </label>
                                <Select 
                                    value={selectedTargetToken} 
                                    onValueChange={setSelectedTargetToken}
                                    disabled={botRunning}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Target Token">
                                            {selectedTargetToken && (
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`w-6 h-6 rounded-full ${
                                                            selectedTargetToken === Tokens.STAR1.address
                                                                ? "bg-blue-500"
                                                                : selectedTargetToken === Tokens.STAR2.address
                                                                ? "bg-purple-500"
                                                                : "bg-gray-500"
                                                        } flex items-center justify-center`}
                                                    >
                                                        <span className="text-white font-bold text-sm">
                                                            {selectedTargetToken === Tokens.STAR1.address
                                                                ? "$"
                                                                : selectedTargetToken === Tokens.STAR2.address
                                                                ? "A"
                                                                : "T"}
                                                        </span>
                                                    </div>
                                                    {
                                                        Object.values(Tokens).find(
                                                            (token) => token.address === selectedTargetToken
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
                                disabled={botRunning}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">
                                Slippage Tolerance
                            </label>
                            <Select 
                                value={slippageTolerance} 
                                onValueChange={setSlippageTolerance}
                                disabled={botRunning}
                            >
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

                        {!botRunning ? (
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
                        ) : (
                            <Button
                                className="w-full h-12 text-lg"
                                size="lg"
                                variant="destructive"
                                onClick={handleStopArbitrage}
                                disabled={stopLoading || !connected}
                            >
                                {stopLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Stopping Bot...
                                    </div>
                                ) : (
                                    "Stop Arbitrage Bot"
                                )}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ArbitragePage;