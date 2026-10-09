import React from "react";

type LogoProps = {
    /** Wordmark colour. Defaults to the brand navy. */
    textClassName?: string;
    className?: string;
    iconSize?: number;
};

/** Hexagonal cube mark + GlobexiaCorp wordmark. */
export function LogoMark({ size = 32 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M16 1.5 28.5 8.75v14.5L16 30.5 3.5 23.25V8.75L16 1.5Z" fill="#FF5A0A" />
            <path d="M16 1.5 28.5 8.75 16 16 3.5 8.75 16 1.5Z" fill="#FF8A3D" />
            <path d="M16 16v14.5L3.5 23.25V8.75L16 16Z" fill="#E84800" />
            <path d="M16 16 28.5 8.75v14.5L16 30.5V16Z" fill="#FF5A0A" />
            <path d="M16 9.2 22.3 12.85v7.3L16 23.8l-6.3-3.65v-7.3L16 9.2Z" fill="#fff" fillOpacity=".92" />
            <path d="M16 9.2 22.3 12.85 16 16.5l-6.3-3.65L16 9.2Z" fill="#fff" />
        </svg>
    );
}

export default function Logo({
    textClassName = "text-[#12123f]",
    className = "",
    iconSize = 32,
}: LogoProps) {
    return (
        <span className={`inline-flex items-center gap-2 ${className}`}>
            <LogoMark size={iconSize} />
            <span
                className={`font-display text-[24px] font-medium leading-none tracking-tight ${textClassName}`}
            >
                GlobexiaCorp
            </span>
        </span>
    );
}
