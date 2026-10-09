import HeroSection from "@/usercomponents/HeroSection";
import PartnersBento from "@/usercomponents/home/PartnersBento";
import MissionAccordion from "@/usercomponents/home/MissionAccordion";
import InsightsVisual from "@/usercomponents/home/InsightsVisual";
import StatsMap from "@/usercomponents/home/StatsMap";
import WhyChooseUs from "@/usercomponents/home/WhyChooseUs";
import NewsletterSignup from "@/usercomponents/NewsletterSignup";
import React from "react";

function Home() {
    return (
        <div>
            <HeroSection />
            <PartnersBento />
            <MissionAccordion />
            <InsightsVisual />
            <StatsMap />
            <WhyChooseUs />
            <NewsletterSignup />
        </div>
    );
}
export default Home;
