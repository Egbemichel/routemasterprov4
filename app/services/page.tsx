"use client";

import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import TrackingDialog from "@/usercomponents/TrackingDialog";
import Button from "@/usercomponents/Button";
import Image from "next/image";

const steps = [
    {
        title: "Regional, National and International Shipping",
        description: "Efficient delivery services across 50+ cities worldwide, tailored for both individuals and businesses.",
        mediaType: "image",
        mediaSrc: "/images/image15.jpg",
    },
    {
        title: "Real-Time Package Tracking",
        description: "Track every package from pickup to delivery using our web-based platform with live GPS updates.",
        mediaType: "image",
        mediaSrc: "/images/image16.png",
    },
    {
        title: "Bulk & Business Logistics",
        description: "Customer solutions for SMEs, e-commerce vendors, and cooperate clients managing high-volumes deliveries.",
        mediaType: "image",
        mediaSrc: "/images/image17.jpg",
    },
    {
        title: "Last-Mile Delivery",
        description: "Fast reliable last-mile solutions that ensure your packages reaches its final destination without delays.",
        mediaType: "image",
        mediaSrc: "/images/image18.jpg",
    },
];


const ServicesPage = () => {
    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    return (
        <>
            <div className="px-6 py-12 max-w-5xl mx-auto space-y-10">
                <h2 className="text-3xl font-bold text-center">All About Us</h2>

                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="flex flex-col md:flex-row items-center gap-6 md:gap-12"
                        data-aos="fade-up"
                        data-aos-delay={index * 200}
                    >
                        <div className="flex-1 space-y-2">
                            <h3 className="text-xl font-semibold">{step.title}</h3>
                            <p className="text-gray-600">{step.description}</p>
                        </div>

                        <div className="flex-1 max-w-md w-full">
                            {step.mediaType === "image" ? (
                                <Image
                                    src={step.mediaSrc}
                                    alt={step.title}
                                    className="rounded-xl shadow-md w-full object-cover"
                                />
                            ) : (
                                <video
                                    src={step.mediaSrc}
                                    controls
                                    className="rounded-xl shadow-md w-full"
                                />
                            )}
                        </div>
                    </div>
                ))}
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
        </>
    );
}
export default ServicesPage;