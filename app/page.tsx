"use client";
import { useActiveAddress, useConnection } from "arweave-wallet-kit";
import { useEffect } from "react";
import { LandingPage } from "@/components/pages/LandingPage";
import { toast } from "sonner";
import { mainProcessId } from "@/lib/config";
import { useRouter } from "next/navigation";
import { spawnProcess, messageResult } from "@/lib/aoService";

export default function Home() {
    const { connected } = useConnection();
    const address = useActiveAddress();
    const router = useRouter();

    useEffect(() => {

      console.log("Connected", connected + ": " + address);
        const addUser = async () => {
            if (connected && address) {
                // check if user exists in database
                // if not, create user & spawn a new process
                // if yes, show the toast that wallet is connected

                try {
                  console.log("Getting user");
                    const user = await messageResult(mainProcessId, [
                        { name: "function", value: "getUser" },
                        { name: "Wallet_Address", value: address },
                    ]);

                    console.log("User", user);
                    const userData = JSON.parse(user.Messages[0]?.Data || "[]");

                    console.log("User data", userData);

                    if(!userData || userData.length === 0) {
                      console.log("User not found, spawning process");
                      console.log(window.arweaveWallet)
                      const processId = await spawnProcess();
                      if(processId) {
                        console.log("Process spawned, adding user");
                        await messageResult(mainProcessId, [
                          { name: "function", value: "addUser" },
                          { name: "Wallet_Address", value: address },
                          { name: "Process_ID", value: processId },
                        ]);
                      } else {
                        console.error("Error spawning process");
                      }
                    }
                } catch (error) {
                    console.error("Error fetching user", error);
                }

                toast("dum dum says your wallet is connected!", {
                    action: {
                        label: "Go to Portfolio",
                        onClick: () => router.push("/portfolio"),
                    },
                });
            }
        };

        addUser();
    }, [connected, address, router]);

    return (
        <div>
            <LandingPage />
        </div>
    );
}
