"use client";

import React from "react";
import { FeatureRows, FloatingActions, PageHero } from "@/usercomponents/home/PageParts";
import InsightsVisual from "@/usercomponents/home/InsightsVisual";
import WhyChooseUs from "@/usercomponents/home/WhyChooseUs";
import NewsletterSignup from "@/usercomponents/NewsletterSignup";

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

const ServicesPage = () => (
    <>
        <PageHero eyebrow="Services" title="Our" highlight="Services" model="truck" />
        <FeatureRows steps={steps} />
        <InsightsVisual />
        <WhyChooseUs />
        <NewsletterSignup />
        <FloatingActions />
    </>
);

export default ServicesPage;
