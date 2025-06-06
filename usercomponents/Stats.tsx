'use client';

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Load odometer dynamically to avoid SSR issues
const Odometer = dynamic(() => import('react-odometerjs'), { ssr: false });

export default function StatsComponent() {
    const [hasAnimated, setHasAnimated] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [hasAnimated]);

    return (
        <section
            ref={containerRef}
            className="w-full px-4 sm:px-8 md:px-16 lg:px-24 py-10 font-pilcrow"
        >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-10">
                {/* Left - Image */}
                <div className="w-full md:w-1/2">
                    <div className="relative w-full aspect-[3/4] rounded-[2rem] overflow-hidden">
                        <Image
                            src="/images/image10.jpg"
                            alt="Packages being delivered"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>

                {/* Right - Text and Stats */}
                <div className="w-full md:w-1/2 space-y-6 text-primary-200">
                    <div>
                        <h2 className="text-5xl sm:text-6xl font-medium">
                            <Odometer
                                value={hasAnimated ? 1 : 0}
                                format="(,ddd).dd"
                                duration={2000}
                            />
                            million +
                        </h2>
                        <p className="text-body sm:text-base mt-1 text-black-color">
                            Packages delivered.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-5xl sm:text-6xl font-medium">
                            <Odometer
                                value={hasAnimated ? 85 : 0}
                                format="d"
                                duration={2000}
                            />{" "}
                            %
                        </h2>
                        <p className="text-body sm:text-base mt-1 text-black-color">
                            Of customers ship with us again.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-5xl sm:text-6xl font-medium">
                            <Odometer
                                value={hasAnimated ? 50 : 0}
                                format="(,ddd).dd"
                                duration={2000}
                            />
                            +
                        </h2>
                        <p className="text-body sm:text-base mt-1 text-black-color">
                            Cities that we deliver to.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
