import React from "react";

/** Shared big section title: navy with an orange highlight word. */
export default function SectionHeading({
    eyebrow,
    children,
    className = "",
    align = "center",
}: {
    eyebrow?: string;
    children: React.ReactNode;
    className?: string;
    align?: "center" | "left";
}) {
    return (
        <div className={`${align === "center" ? "text-center" : "text-left"} ${className}`}>
            {eyebrow && (
                <p data-reveal className="mb-3 text-[12px] font-medium uppercase tracking-[0.16em] text-[#ff5a0a]">
                    {eyebrow}
                </p>
            )}
            <h2
                data-reveal
                className="font-display text-[clamp(2.2rem,5.4vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.04em] text-[#12123f]"
            >
                {children}
            </h2>
        </div>
    );
}

export const Hl = ({ children }: { children: React.ReactNode }) => <span className="text-[#ff5a0a]">{children}</span>;
