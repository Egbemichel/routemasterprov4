"use client";

import { RefObject, useEffect } from "react";
import { gsap } from "gsap";

/**
 * Animates matching children in as each one scrolls into view.
 * Targets are observed individually, so a very tall container (e.g. a long page on a phone)
 * can never get stuck hidden waiting for a percentage of itself to be visible.
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
            if (!targets.length) return;
            gsap.set(targets, { opacity: 0, y: 40 });
            const io = new IntersectionObserver(
                (entries) => {
                    const visible = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
                    if (!visible.length) return;
                    visible.forEach((t) => io.unobserve(t));
                    gsap.to(visible, {
                        opacity: 1,
                        y: 0,
                        duration: 0.9,
                        stagger: 0.09,
                        ease: "power3.out",
                        clearProps: "transform,opacity",
                        ...vars,
                    });
                },
                { threshold: 0.08, rootMargin: "0px 0px -4% 0px" },
            );
            targets.forEach((t) => io.observe(t));
            return () => io.disconnect();
        }, root);
        return () => ctx.revert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
