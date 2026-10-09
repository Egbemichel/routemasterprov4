"use client";

import React from "react";
import { FeatureRows, FloatingActions, PageHero } from "@/usercomponents/home/PageParts";
import MissionAccordion from "@/usercomponents/home/MissionAccordion";
import StatsMap from "@/usercomponents/home/StatsMap";
import NewsletterSignup from "@/usercomponents/NewsletterSignup";

const steps = [
    {
        title: "Locally Rooted, Globally Inspired",
        description: "We are a UK-based logistics platform blending local knowledge with international shipping standards.",
        mediaType: "image",
        mediaSrc: "/images/image11.jpg",
    },
    {
        title: "Customer-Centric Approach",
        description: "Every delivery starts and ends with you, our systems, support, and services are all built around your needs.",
        mediaType: "image",
        mediaSrc: "/images/image12.jpg",
    },
    {
        title: "Tech-Driven Logistics",
        description: "With advanced tracking, streamlined booking, and real-time updates, we make shipping seamless and transparent.",
        mediaType: "image",
        mediaSrc: "/images/image13.jpg",
    },
    {
        title: "Trusted By Thousands",
        description: "Individuals, small businesses, and large enterprises rely on us daily to move goods safely and on time.",
        mediaType: "image",
        mediaSrc: "/images/image14.png",
    },
];

const AboutPage = () => (
    <>
        <PageHero eyebrow="About us" title="All About" highlight="Us" model="globe" />
        <FeatureRows steps={steps} />
        <MissionAccordion />
        <StatsMap />
        <NewsletterSignup />
        <FloatingActions />
    </>
);

export default AboutPage;
