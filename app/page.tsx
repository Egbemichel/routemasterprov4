import HeroSection from "@/usercomponents/HeroSection";
import Header from "@/usercomponents/Header";
import CarouselContainer from "@/usercomponents/Carousel";
import MissionBanner from "@/usercomponents/MissionBanner";
import Image from "next/image";
import ShippingInsights from "@/usercomponents/ShippingInsights";
import StatsComponent from "@/usercomponents/Stats";
import WhyChooseUs from "@/usercomponents/WhyChooseUs";
import NewsletterSignup from "@/usercomponents/NewsletterSignup";
import React from "react";


function Home() {
  return (
    <div className="">
      <HeroSection />
        <Header
        largeText="Our"
        largeTextHighlight="Trusted"
        largeText2="Partners"
        />
      <div className="flex flex-col items-center justify-center">
          <CarouselContainer />
      </div>
        <MissionBanner
            // Text content
            labelText="Our Mission"
            titleText="Simple is best"
            descriptionText="To simplify logistics and empower businesses and individuals with fast, quality, and reliable shipping solutions, locally and globally. We are on a mission to make every delivery seamless, trackable, and stress-free."
            labelSize='20px'

            rightColumnRatio="medium"  // Options: "small", "medium", "large"
            stackOnMobile={true}       // Stack on mobile or keep side-by-side


            // Optional styling adjustments
            labelColor="text-secondary-100"
            titleColor="text-primary-200"
            descriptionColor="text-black-color"

            // Optional right column content
            rightColumnClassName="bg-greay-color rounded-[55px]"
            rightColumnContent={
                <Image
                    src="/images/image.svg"
                    alt="Company Images"
                    width={575}
                    height={348}
                />
            }
        />
        <MissionBanner
            // Text content
            labelText="Our Core Values"
            titleText="What drives us?"
            descriptionText="We are driven by reliability, customer focus, and transparency, delivering every package with speed, care, and integrity. Our tech-powered approach ensures quality, security, and sustainable logistics you can count on."
            labelSize='20px'

            rightColumnRatio="medium"  // Options: "small", "medium", "large"
            stackOnMobile={true}       // Stack on mobile or keep side-by-side


            // Optional styling adjustments
            labelColor="text-secondary-100"
            titleColor="text-primary-200"
            descriptionColor="text-black-color"

            // Optional right column content
            rightColumnClassName="bg-greay-color rounded-[55px]"
            rightColumnContent={
                <Image
                    src="/images/image.svg"
                    alt="Company Images"
                    width={575}
                    height={348}
                />
            }
        />
        <ShippingInsights
            labelText="Shipping Insights"
            labelColor="text-secondary-100"
            labelSize='20px'
            headingColor="text-primary-200"
            descriptionColor='text-black-color'
        />
        <StatsComponent />
        <WhyChooseUs />
        <NewsletterSignup />

    </div>
  );
}
export default Home;
