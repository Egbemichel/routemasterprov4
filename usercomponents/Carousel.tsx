import Image from "next/image";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

const imageUrls = [
    "/images/image1.jpg",
    "/images/image2.png",
    "/images/image3.jpg",
    "/images/image4.jpg",
    "/images/image5.jpg",
    "/images/image6.png",
    "/images/image7.png",
];

const CarouselContainer = () => {
    return (
        <Carousel
            className="w-full max-w-2xs sm:max-w-[950px]"
            opts={{
                align: "start",
                loop: true,
            }}
        >
            <CarouselContent className="-ml-1">
                {imageUrls.map((src, index) => (
                    <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                            <Card className="border-none">
                                <CardContent className="flex aspect-square items-center justify-center p-0">
                                    <Image
                                        src={src}
                                        alt={`Slide ${index + 1}`}
                                        width={100}
                                        height={100}
                                        className="object-cover w-full h-full rounded-md"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    );
};

export default CarouselContainer;
