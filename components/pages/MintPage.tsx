"use client";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { useConnection, useActiveAddress } from "arweave-wallet-kit";
import { toast } from "sonner";
import { Info, Loader2 } from "lucide-react";
import { dryrunResult, messageResult } from "@/lib/aoService";
import { mainProcessId } from "@/lib/config";



export const MintPage = () => {
    const { connected } = useConnection();
    const [amount, setAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [userPid, setUserPid] = useState<string | undefined>(undefined);
    
    const address = useActiveAddress();

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

    async function handleMint() {
        if (!connected) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (amount > 100) {
            toast.error("You can only mint up to 100 tokens at a time.");
            return;
        }
        if (!userPid) {
            toast.error("User process ID not found. Please try again.");
            return;
        }
    
        try {
            setIsLoading(true);
            console.log("Reached here");
            console.log("The user PID is", userPid);
            const res = await messageResult("yoNtlglzbxbwmRGECmSLX4q-lpEpUpbhSLkX8qlKXmo", [
                { name: "Action", value: "RequestTokens" },
                { name: "Quantity", value: amount.toString() },
                { name: "Recipient", value: userPid }
            ]);
            
            console.log(res); // Log the entire response object to see its structure
            
            // Extract the success message from the response
            if (res && res.Messages && res.Messages[0]) {
                const message = res.Messages[1].Data || "Tokens minted successfully";
                toast.success(message);
            } else {
                toast.success("Tokens minted successfully");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to mint tokens");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-[70vh]">
            <Card className="w-[58vw] h-[52vh] rounded-none bg-[white]/80 backdrop-blur-md border-gray-800">
                <CardContent className="p-6 space-y-6">
                    <div>
                        <CardTitle className="text-2xl mb-1">Mint Tokens</CardTitle>
                        <CardDescription className="text-xl">
                            Get test tokens for simulating your investment
                        </CardDescription>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">
                                Token Amount
                            </label>
                            <Input
                                type="number"
                                placeholder="Enter amount to mint"
                                min={0}
                                max={10}
                                className="w-full text-lg h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={amount || ""}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <Separator />

                        <Button
                            className="w-full h-12 text-lg"
                            size="lg"
                            onClick={handleMint}
                            disabled={isLoading || !connected}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Minting...
                                </div>
                            ) : (
                                "Mint Tokens"
                            )}
                        </Button>

                        <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            <div>NOTE: This is for testing purposes only.</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MintPage;
