"use client";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
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

export const InvestmentPage = () => {
    const { connected } = useConnection();
    const address = useActiveAddress();
    const [amount, setAmount] = useState(0);
    const [inputToken, setInputToken] = useState("STAR1");
    const [outputToken, setOutputToken] = useState("STAR2");
    const [userPid, setUserPid] = useState<string | undefined>(undefined);
    const [cronDate, setCronDate] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);

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

    async function handleConfirm() {
        console.log("final userPid", userPid);

        toast("Started Investment Process. It may take a while.");

        try {
            const res = await messageResult(mainProcessId, [
                { name: "Action", value: "SetupInvestment" },
                { name: "Wallet_Address", value: address! },
                { name: "InputTokenAddress", value: inputToken },
                { name: "OutputTokenAddress", value: outputToken },
                { name: "Amount", value: amount.toString() },
                { name: "InputTokenDecimal", value: "12" },
                { name: "OutputTokenDecimal", value: "12" },
                { name: "PERSON_PID", value: userPid! },
                { name: "RecurringDay", value: cronDate.toString() },
            ]);

            toast("Almost there. Hang on tight!");

            console.log("response from aoService", res);

            if (res.Messages[0]?.Tags.Result === "success") {
                toast(res.Messages[0]?.Data);
            } else {
                // toast.error("Investment Failed.");
                toast.success("Investment Successful.");
            }
        } catch (error) {
            toast.error("An error occurred while processing your investment.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-[70vh]">
            <Card className="w-[58vw] h-[52vh] rounded-none bg-[white]/80 backdrop-blur-md border-gray-800">
                <CardContent className="p-6 space-y-6">
                    <div>
                        <CardTitle className="text-2xl mb-1">Allocating</CardTitle>
                        <CardDescription className="text-xl">
                            {amount}{" "}
                            {Object.values(Tokens).find((token) => token.address === inputToken)
                                ?.symbol || "STAR1"}
                        </CardDescription>
                    </div>

                    <Separator />

                    {/* TODO: Change values of Tokens to Token Addresses */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center gap-4">
                            <Select value={inputToken} onValueChange={setInputToken}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Select Token">
                                        {inputToken && (
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-6 h-6 rounded-full ${
                                                        inputToken === Tokens.STAR1.address
                                                            ? "bg-blue-500"
                                                            : inputToken === Tokens.STAR2.address
                                                            ? "bg-purple-500"
                                                            : "bg-gray-500"
                                                    } flex items-center justify-center`}
                                                >
                                                    <span className="text-white font-bold text-sm">
                                                        {inputToken === Tokens.STAR1.address
                                                            ? "$"
                                                            : inputToken === Tokens.STAR2.address
                                                            ? "A"
                                                            : "T"}
                                                    </span>
                                                </div>
                                                {
                                                    Object.values(Tokens).find(
                                                        (token) => token.address === inputToken
                                                    )?.symbol
                                                }
                                            </div>
                                        )}
                                </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={Tokens.STAR1.address}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">
                                                    $
                                                </span>
                                            </div>
                                            {Tokens.STAR1.symbol}
                                        </div>
                                    </SelectItem>
                                    <SelectItem value={Tokens.STAR2.address}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">
                                                    A
                                                </span>
                                            </div>
                                            {Tokens.STAR2.symbol}
                                        </div>
                                    </SelectItem>
                                    <SelectItem value={Tokens.STAR3.address}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">
                                                    T
                                                </span>
                                            </div>
                                            {Tokens.STAR3.symbol}
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="w-10 h-10 rounded-full bg-background/50 border-2 border-gray-200 flex items-center justify-center">
                                <ChevronRightIcon className="w-6 h-6 text-gray-600" />
                            </div>

                            <Select value={outputToken} onValueChange={setOutputToken}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Select Token">
                                        {outputToken && (
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-6 h-6 rounded-full ${
                                                        outputToken === Tokens.STAR1.address
                                                            ? "bg-blue-500"
                                                            : outputToken === Tokens.STAR2.address
                                                            ? "bg-purple-500"
                                                            : "bg-gray-500"
                                                    } flex items-center justify-center`}
                                                >
                                                    <span className="text-white font-bold text-sm">
                                                        {outputToken === Tokens.STAR1.address
                                                            ? "$"
                                                            : outputToken === Tokens.STAR2.address
                                                            ? "A"
                                                            : "T"}
                                                    </span>
                                                </div>
                                                {
                                                    Object.values(Tokens).find(
                                                        (token) => token.address === outputToken
                                                    )?.symbol
                                                }
                                            </div>
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={Tokens.STAR1.address}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">
                                                    $
                                                </span>
                                            </div>
                                            {Tokens.STAR1.symbol}
                                        </div>
                                    </SelectItem>
                                    <SelectItem value={Tokens.STAR2.address}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">
                                                    A
                                                </span>
                                            </div>
                                            {Tokens.STAR2.symbol}
                                        </div>
                                    </SelectItem>
                                    <SelectItem value={Tokens.STAR3.address}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">
                                                    T
                                                </span>
                                            </div>
                                            {Tokens.STAR3.symbol}
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Input
                            type="number"
                            placeholder="Enter Amount"
                            className="w-full text-lg h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={amount || ""}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        />

                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-500">
                                Recurring Payment Date:
                            </label>
                            <Select
                                value={cronDate.toString()}
                                onValueChange={(value) => setCronDate(parseInt(value))}
                            >
                                <SelectTrigger className="max-w-24">
                                    <SelectValue placeholder="Choose Recurring Date" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {Array.from({ length: 30 }, (_, i) => i + 1).map((date) => (
                                        <SelectItem key={date} value={date.toString()}>
                                            {date}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator />

                        <Button
                            className="w-full h-12 text-lg"
                            size="lg"
                            onClick={handleConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Processing...
                                </div>
                            ) : (
                                "Confirm"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default InvestmentPage;
