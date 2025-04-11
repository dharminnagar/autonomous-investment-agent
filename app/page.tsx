"use client";
import { useActiveAddress, useConnection } from "arweave-wallet-kit";
import { useEffect } from "react";
import { LandingPage } from "@/components/pages/LandingPage";
import { toast } from "sonner";
import { mainProcessId } from "@/lib/config";
import { useRouter } from "next/navigation";
import { spawnProcess, messageResult, dryrunResult } from "@/lib/aoService";

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

                  console.log("Getting user");
                    const user = await dryrunResult(mainProcessId, [
                        { name: "Action", value: "getUser" },
                        { name: "Wallet_Address", value: address },
                    ]);

                    console.log("User", user);

                    if(!user || user.length === 0) {
                      console.log("User not found, spawning process");
                      
                      const processId = await spawnProcess();

                      if(processId) {
                        console.log("Process spawned, adding user", processId);
                        await messageResult(mainProcessId, [
                          { name: "Action", value: "addUser" },
                          { name: "Wallet_Address", value: address },
                          { name: "Process_ID", value: processId },
                        ]);
                      } else {
                        console.error("Error spawning process");
                      }
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
