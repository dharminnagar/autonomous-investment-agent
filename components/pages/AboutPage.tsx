import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GitHubIconDark, TwitterIcon, LinkedInIcon } from "@/lib/icons";
import Image from "next/image";

export const AboutPage = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full h[70vh] p-8">
            <Card className="w-[80vw] rounded-none bg-[white]/80 backdrop-blur-md border-gray-800">
                <CardContent className="p-8 space-y-8">
                    {/* Project Information Section */}
                    <div className="space-y-4">
                        <CardTitle className="text-5xl text-center">About InvestAr</CardTitle>
                        <CardDescription className="text-lg">
                            A decentralized investment platform built on the Arweave network, enabling automated and transparent investment strategies.
                        </CardDescription>
                        <div className="prose prose-lg max-w-none">
                            <p>
                                Our platform leverages the power of <span className="font-bold">Arweave</span>&apos;s permanent and decentralized storage capabilities. It is an autonomous decentralized investment solution where users can plan their investment strategies while maintaining full control over their assets.
                            </p>
                            <p>
                                We have currently implemented the dollar cost averaging strategy for the users to invest in the <span className="underline">STAR</span> token, a custom token we made for this project.
                            </p>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Meet the Buidlers Section */}
                    <div className="space-y-6">
                        <CardTitle className="text-4xl text-center">Meet the Buidlers</CardTitle>
                        <div className="relative h-[500px] w-full flex items-center justify-center">
                            {/* Yatharth's Card - Left */}
                            <Card className="absolute left-[10%] z-10 bg-background/40 shadow-lg w-[300px] transform -translate-y-4 -rotate-5 hover:z-20 transition-all duration-300 hover:-rotate-3 hover:bg-background/60">
                                <CardContent className="p-6 space-y-4">
                                    <div>
                                        <CardTitle className="text-xl">Yatharth Singh Panwar</CardTitle>
                                        <CardDescription>Co-Buidler</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4">
                                        <a
                                            href="https://github.com/yatharth-singh-panwar"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="hover:opacity-80"
                                        >
                                            <GitHubIconDark size={24} />
                                        </a>
                                        <a
                                            href="https://twitter.com/yatharthpnwr"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="hover:opacity-80"
                                        >
                                            <TwitterIcon size={24} />
                                        </a>
                                        <a
                                            href="https://www.linkedin.com/in/yatharth-singh-panwar-153058288"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="hover:opacity-80"
                                        >
                                            <LinkedInIcon size={24} />
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Team Image - Center */}
                            <div className="relative w-[400px] h-[400px] rounded-2xl overflow-hidden z-0">
                                <Image
                                    src="/images/buidlers.jpeg"
                                    alt="The Buidlers"
                                    fill
                                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                                    className="rounded-2xl"
                                />
                            </div>

                            {/* Dharmin's Card - Right */}
                            <Card className="absolute right-[10%] z-10 bg-background/40 shadow-lg w-[300px] transform translate-y-4 rotate-5 hover:z-20 transition-all duration-300 hover:rotate-3 hover:bg-background/60">
                                <CardContent className="p-6 space-y-4">
                                    <div>
                                        <CardTitle className="text-xl">Dharmin Nagar</CardTitle>
                                        <CardDescription>Co-Buidler</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4">
                                        <a
                                            href="https://github.com/dharminnagar"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="hover:opacity-80"
                                        >
                                            <GitHubIconDark size={24} />
                                        </a>
                                        <a
                                            href="https://twitter.com/dharminnagar"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="hover:opacity-80"
                                        >
                                            <TwitterIcon size={24} />
                                        </a>
                                        <a
                                            href="https://linkedin.com/in/nagardharmin"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="hover:opacity-80"
                                        >
                                            <LinkedInIcon size={24} />
                                        </a>
                                    </div>
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