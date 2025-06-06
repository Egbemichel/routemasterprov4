'use client';

import Button from "@/usercomponents/Button";

export default function NewsletterSignup() {
    return (
        <section className="text-primary-200 py-6 px-4 sm:px-6 lg:px-8 rounded-2xl mt-12 max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-[56px] font-bold text-center mb-6 font-pilcrow">
                Sign up to our newsletter
            </h2>

            <form className="flex flex-col sm:flex-row items-center gap-4 sm:gap-2 justify-center bg-primary-200 rounded-2xl p-6">
                <input
                    type="email"
                    placeholder="Enter your email..."
                    className="w-full sm:flex-1 px-4 py-3 rounded-2xl sm:h-[90px] h-[60px] bg-gray-color text-black placeholder-black-color focus:outline-none"
                />
                <Button
                type="submit"
                imageSrc={'icons/sent.svg'}
                imageAlt={'Send'}
                imageHeight={40}
                imageWidth={40}
                text={'Submit'}
                bgColor={'bg-primary-100'}
                textColor={'text-white-color font-extrabold'}
                fontSize={"text-[16px]"}
                width={"w-[170px]"}
                className="h-[54px] gap-2 rounded-2xl"
                border={"border-none"}
                borderRadius={"rounded-2xl"}
                />
            </form>
        </section>
    );
}
