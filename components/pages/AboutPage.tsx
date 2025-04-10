import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const AboutPage = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen p-8">
            <Card className="w-[80vw] rounded-none bg-[white]/80 backdrop-blur-md border-gray-800">
                <CardContent className="p-8 space-y-8">
                    {/* Project Information Section */}
                    <div className="space-y-4">
                        <CardTitle className="text-3xl">About Autonomous Investment Agent</CardTitle>
                        <CardDescription className="text-lg">
                            A decentralized investment platform built on the Arweave network, enabling automated and transparent investment strategies.
                        </CardDescription>
                        <div className="prose prose-lg max-w-none">
                            <p>
                                Our platform leverages the power of blockchain technology to create a trustless investment environment where users can automate their investment strategies while maintaining full control over their assets.
                            </p>
                            <p>
                                Built on the Arweave network, we ensure permanent storage of investment records and transparent execution of investment strategies through smart contracts.
                            </p>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Meet the Buidlers Section */}
                    <div className="space-y-6">
                        <CardTitle className="text-2xl">Meet the Buidlers</CardTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Developer 1 Card */}
                            <Card className="bg-background/50">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
                                            <span className="text-white text-2xl font-bold">D</span>
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">Dharmin Shah</CardTitle>
                                            <CardDescription>Lead Developer</CardDescription>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Full-stack developer passionate about blockchain technology and decentralized systems.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Developer 2 Card */}
                            <Card className="bg-background/50">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center">
                                            <span className="text-white text-2xl font-bold">A</span>
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">Ankit Shah</CardTitle>
                                            <CardDescription>Blockchain Developer</CardDescription>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Blockchain developer specializing in smart contracts and decentralized applications.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AboutPage;