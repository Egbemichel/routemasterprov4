"use client";

import { RefObject, useEffect } from "react";
import { gsap } from "gsap";

/**
 * Animates matching children in once the container scrolls into view.
 * Elements are hidden by gsap itself (not CSS), so with JS disabled the content is still visible.
 */
export function useReveal(
    ref: RefObject<HTMLElement | null>,
    selector = "[data-reveal]",
    vars: gsap.TweenVars = {},
) {
    useEffect(() => {
        const root = ref.current;
        if (!root) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const ctx = gsap.context(() => {
            const targets = gsap.utils.toArray<HTMLElement>(selector, root);
            gsap.set(targets, { opacity: 0, y: 40 });
            const io = new IntersectionObserver(
                ([e]) => {
                    if (!e.isIntersecting) return;
                    io.disconnect();
                    gsap.to(targets, {
                        opacity: 1,
                        y: 0,
                        duration: 0.9,
                        stagger: 0.09,
                        ease: "power3.out",
                        clearProps: "transform,opacity",
                        ...vars,
                    });
                },
                { threshold: 0.15 },
            );
            io.observe(root);
            return () => io.disconnect();
        }, root);
        return () => ctx.revert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
