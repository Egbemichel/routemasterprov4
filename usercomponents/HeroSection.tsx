import React from 'react';
import Image from "next/image";
import Header from "@/usercomponents/Header";
import Button from "@/usercomponents/Button";
import TrackingDialog from "@/usercomponents/TrackingDialog";

const HeroSection = () => {
    return (
        <div className="relative min-h-screen">
            {/* Header - must be above the background */}
            <div className="relative z-20">
                <Header
                    smallText="Delivering beyond borders"
                    largeText2="Anywere."
                    largeText="Moving What Matters"
                    largeTextHighlight="Most"
                    largeTextHighlight2="On Time."
                    largeText3="Every Time."
                />
            </div>

            {/* Background Image */}
            <div className="absolute inset-0 z-0 w-full h-[830px] md:h-80 lg:h-[550px]">
                <Image
                    src="/images/image.svg"
                    alt="Image of a shipping dock"
                    fill
                    className="object-cover"
                />
            </div>

            {/* Floating Button Group */}
            <div className="fixed bottom-8 md:w-[330px] lg:w-[480px] h-[90px] left-1/2 transform -translate-x-1/2 z-30 bg-gray-color/30 px-[44px] py-[18px] rounded-[20px]">
                <div className="flex gap-2">
                    {/* Track Now Button */}
                    <TrackingDialog
                        trigger={
                            <Button
                                imageSrc="/icons/route-03.svg"
                                padding="px-[30px]"
                                width="170px"
                                className="h-[54px] gap-2 font-extrabold"
                                imageAlt="Tracking logo"
                                imageWidth={40}
                                imageHeight={40}
                                bgColor="bg-primary-200"
                                text="Track Now"
                                textColor="text-white-color"
                                fontSize="text-[16px]"
                                fontFamily="font-archivo"
                                border="border-none"
                                borderRadius="rounded-[16px]"
                                hoverBgColor="hover:bg-blue-600"
                            />
                        }
                    />

                    {/* Get Quote Button */}
                    <Button
                        imageSrc="/icons/estimate-01.svg"
                        padding="px-[30px] py-[10px]"
                        width="170px"
                        className="h-[54px] gap-2 font-extrabold rounded-[16px]"
                        imageAlt="Tracking logo"
                        imageWidth={40}
                        imageHeight={40}
                        bgColor="bg-secondary-100"
                        text="Get Qoute"
                        textColor="text-white-color"
                        fontSize="text-[16px]"
                        fontFamily="font-archivo"
                        border="border-none"
                        borderRadius="rounded-[16px]"
                        hoverBgColor="hover:bg-orange-600"
                    />
                </div>
            </div>
        </div>

    );
};

export default HeroSection;