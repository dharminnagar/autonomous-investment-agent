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
import { useConnection } from "arweave-wallet-kit";
import { toast } from "sonner";

export const InvestmentPage = () => {
    const { connected } = useConnection();
    const [amount, setAmount] = useState(0);
    const [token, setToken] = useState("AR");
    const [cronDate, setCronDate] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            if (!connected) {
                toast("dum dum requires your wallet to continue");
            } else {
                toast("dum dum says your wallet is connected!");
            }
        }
        fetchData();
    }, [connected]);

    return (
        <div className="flex flex-col items-center justify-center w-full h-[70vh]">
            <Card className="w-[58vw] h-[52vh] rounded-none bg-[white]/80 backdrop-blur-md border-gray-800">
                <CardContent className="p-6 space-y-6">
                    <div>
                        <CardTitle className="text-2xl mb-1">Allocating</CardTitle>
                        <CardDescription className="text-xl">
                            {amount} {token}
                        </CardDescription>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center gap-4">
                            <Select value={token} onValueChange={setToken}>
                                <SelectTrigger className="w-32">
                                    <div className="flex items-center gap-2">
                                        <SelectValue placeholder="AR" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AR">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">
                                                    $
                                                </span>
                                            </div>
                                            AR
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="AO">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">
                                                    A
                                                </span>
                                            </div>
                                            AO
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="TEST">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">
                                                    T
                                                </span>
                                            </div>
                                            TEST
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="w-10 h-10 rounded-full bg-background/50 border-2 border-gray-200 flex items-center justify-center">
                                <ChevronRightIcon className="w-6 h-6 text-gray-600" />
                            </div>

                            <Select>
                                <SelectTrigger className="w-32">
                                    <div className="flex items-center gap-2">
                                        <SelectValue placeholder="AO" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AR">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">
                                                    $
                                                </span>
                                            </div>
                                            AR
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="AO">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">
                                                    A
                                                </span>
                                            </div>
                                            AO
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="TEST">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">
                                                    T
                                                </span>
                                            </div>
                                            TEST
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

                        <Button className="w-full h-12 text-lg" size="lg">
                            Confirm
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default InvestmentPage;