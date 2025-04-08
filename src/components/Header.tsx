import { ConnectButton } from "arweave-wallet-kit"

export const Header = () => {
    return (
        <div className="flex items-center justify-between p-4 border border-gray-300 rounded-full">
            <div className="text-4xl font-bold">Inve<span className="underline">stAr</span></div>
            <ConnectButton />
        </div>
    )
}