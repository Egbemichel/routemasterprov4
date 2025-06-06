import { FC } from 'react';
import Button from "@/usercomponents/Button";
import Image from "next/image";

interface HeaderProps {
    smallText?: string;
    largeText?: string;
    largeText2?: string;
    largeText3?: string;
    largeTextHighlight?: string;
    largeTextHighlight2?: string;
    buttonText?: string;
    sideText?: string;
    buttonWidth?: string;
    buttonHeight?: string;
    buttonColor?: string;
    onButtonClick?: () => void;
    textSize?: string;
    image?: boolean;
}

const ComplaintBanner: FC<HeaderProps> = ({
                                                       smallText = "",
                                                       largeText = "Moving What Matters",
                                                       largeText2 = "",
                                                       largeText3 = "",
                                                       largeTextHighlight = "Most",
                                                       largeTextHighlight2 = "",
                                                       sideText = " ",
                                                       buttonText = '',
                                                       buttonHeight = '',
                                                       buttonWidth = '',
                                                       textSize = '',
                                                       buttonColor = "bg-whiteColor",
                                                       image = false,
                                                   }) => {
    return (
        <div className="p-4 sm:p-6 md:p-8 rounded-lg w-full flex flex-col items-center max-w-screen-xl mx-auto">
            <div className="text-center font-pilcrow">
                <p className="text-primary-200 text-h3 font-medium">{smallText}</p>
                <h2 className="text-[32px] sm:text-[40px] md:text-[48px] lg:text-[68px] font-bold text-primary-200 mb-4 leading-tight">
                    {largeText} <span className="text-secondary-100">{largeTextHighlight}</span>
                    <br /> <span className="text-primary-200">{largeText2}</span> <span className="text-secondary-100">{largeTextHighlight2}</span>
                    <span>{largeText3}</span>
                </h2>

                <div className="flex flex-col md:flex-row items-center justify-center gap-3 mt-4 flex-wrap text-center md:text-left">
                    <Button
                        type='button'
                        width= {buttonWidth}
                        text={buttonText}
                        bgColor={buttonColor}
                        border='border-none'
                        textColor='text-white-color'
                        className={`gap-[10px]  ${buttonHeight}`}
                        borderRadius='rounded-[16px]'
                        fontSize={textSize}
                        fontFamily="font-archivo font-medium"
                    />

                    <div className="flex items-center gap-2 font-archivo text-body text-white-color">
                        <span>{sideText}</span>
                        {image && <Image src="/icons/arrow-right-01.svg" alt="Arrow Right" width={24} height={24}/>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintBanner;