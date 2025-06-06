// components/WhyChooseUs.tsx
'use client';
import Image from  'next/image';

const features = [
    "24/7 real time tracking across international borders with automatic updates and premium customer support.",
    "Reliable Delivery, Every Time. Your packages are safe with us, on time, every time, guaranteed.",
    "Quality that matches pricing. Top tier services that fits your budget, no hidden fees, ever.",
];
const features2 = [
    "Superior Package handling. You care and so do we. A world class team to ensure all your packages remain intact.",
    "Nationwide and International Reach. From local deliveries to global shipping, we cover it all.",
    "Affordable Rates",
];
const features3 = [
    "We move fast, get your shipments where they need to be quicker.",
    "Our support team is just a call away, ready to help anytime.",
    "Businesses and individuals trust us daily, we deliver peace of mind",
];
const features4 = [
    "Smart logistics and automation mean fewer delays and smoother service.",
    "From sender to recipient, we handle everything, no middlemen",
    "Shipping should not be stressful, book in minutes, track instantly",
];

export default function WhyChooseUs() {
    return (
        <section className="py-4 text-center px-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-200 mb-10">
                Why Choose Us?
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-8 gap-x-6 max-w-4xl mx-auto">
                {Array(1).fill(null).map((_, colIdx) => (
                    <div key={colIdx} className="space-y-4">
                        {features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-left text-lg text-black-color">
                                <Image
                                    src='icons/checkmark-circle-03.svg'
                                    alt='Checkmark Circle'
                                    height={30}
                                    width={30}
                                />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                ))}
                {Array(1).fill(null).map((_, colIdx) => (
                    <div key={colIdx} className="space-y-4">
                        {features2.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-left text-lg text-black-color">
                                <Image
                                    src='icons/checkmark-circle-03.svg'
                                    alt='Checkmark Circle'
                                    height={30}
                                    width={30}
                                />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                ))}
                {Array(1).fill(null).map((_, colIdx) => (
                    <div key={colIdx} className="space-y-4">
                        {features3.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-left text-lg text-black-color">
                                <Image
                                    src='icons/checkmark-circle-03.svg'
                                    alt='Checkmark Circle'
                                    height={30}
                                    width={30}
                                />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                ))}
                {Array(1).fill(null).map((_, colIdx) => (
                    <div key={colIdx} className="space-y-4">
                        {features4.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-left text-lg text-black-color">
                                <Image
                                    src='icons/checkmark-circle-03.svg'
                                    alt='Checkmark Circle'
                                    height={30}
                                    width={30}
                                />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
}
