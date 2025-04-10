"use client";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useConnection } from "arweave-wallet-kit";
import { toast } from "sonner";
import { Info, Loader2 } from "lucide-react";

export const MintPage = () => {
    const { connected } = useConnection();
    const [amount, setAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    async function handleMint() {
        if (!connected) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (amount > 10) {
            toast.error("You can only mint up to 10 tokens at a time.");
            return;
        }

        try {
            setIsLoading(true);
            // TODO: Implement minting functionality
            await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulated API call
            toast.success("Tokens minted successfully!");
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
