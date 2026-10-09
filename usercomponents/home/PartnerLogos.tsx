import React from "react";

/**
 * Partner wordmarks redrawn as vector SVGs so they stay razor sharp at any size.
 * Every logo shares a 220 x 90 viewBox so they sit consistently in the bento tiles.
 */

type P = { className?: string };
const FONT = "Arial, Helvetica, sans-serif";

const Svg = ({ children, className = "", label }: { children: React.ReactNode; className?: string; label: string }) => (
    <svg viewBox="0 0 220 90" role="img" aria-label={label} className={className} xmlns="http://www.w3.org/2000/svg">
        {children}
    </svg>
);

export const IlgLogo = ({ className }: P) => (
    <Svg className={className} label="International Logistic Gateway">
        <circle cx="62" cy="14" r="8" fill="#1aa3e8" />
        <rect x="55" y="26" width="14" height="34" rx="2" fill="#0b3a82" />
        <rect x="76" y="14" width="14" height="46" rx="2" fill="#0b3a82" />
        <path d="M90 60h20v-12H90Z" fill="#0b3a82" />
        <path d="M150 34c-4-8-12-12-22-10-14 3-20 18-14 30 5 10 20 12 30 6V40h-18v10h8v3c-5 3-12 1-14-5-3-8 1-16 8-17 5-1 9 1 11 6Z" fill="#0b3a82" />
        <rect x="150" y="14" width="18" height="18" rx="3" fill="#1aa3e8" transform="rotate(45 159 23)" />
        <text x="110" y="76" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="11" fill="#1aa3e8">
            International
        </text>
        <text x="110" y="87" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="11" fill="#0b3a82">
            Logistic Gateway
        </text>
    </Svg>
);

export const GlsLogo = ({ className }: P) => (
    <Svg className={className} label="GLS General Logistics Systems">
        <path d="M34 62C14 56 10 34 28 22c8-5 18-6 28-4l-6-8 24 2-8 20-4-7c-10-3-20 0-24 8-4 8 0 16 10 20Z" fill="#fbb800" />
        <text x="64" y="58" fontFamily={FONT} fontWeight="900" fontSize="46" fill="#1b2a7a" letterSpacing="-1">
            GLS
        </text>
        <text x="62" y="78" fontFamily={FONT} fontWeight="700" fontSize="11.5" fill="#1b2a7a">
            General Logistics Systems
        </text>
    </Svg>
);

export const GoldenLogisticsLogo = ({ className }: P) => (
    <Svg className={className} label="Golden Logistics">
        <path d="M44 46C46 24 76 10 110 22c18 6 30 4 42-10l-6 20c-12 6-28 6-44 0C86 24 62 28 56 46Z" fill="#e3242b" />
        <path d="M150 12l22 6-16 14Z" fill="#e3242b" />
        <text x="110" y="52" textAnchor="middle" fontFamily={FONT} fontWeight="900" fontSize="34" fill="#1b2a7a">
            GL
        </text>
        <text x="110" y="76" textAnchor="middle" fontFamily={FONT} fontWeight="900" fontSize="17" fill="#1b2a7a" letterSpacing="0.5">
            GOLDENLOGISTICS
        </text>
    </Svg>
);

export const CargaGlobalLogo = ({ className }: P) => (
    <Svg className={className} label="Carga Global">
        <g fill="none" stroke="#e8383d" strokeWidth="4" strokeLinecap="round">
            <path d="M44 28c-12 6-16 22-8 34" />
            <path d="M52 22c-4 2-6 4-8 8" />
            <path d="M58 20c12-2 22 6 24 18" />
            <path d="M80 54c-4 12-18 18-30 12" />
            <path d="M46 38c4-6 12-8 18-4" />
            <path d="M74 44c0 8-8 14-16 12" />
        </g>
        <text x="92" y="40" fontFamily={FONT} fontWeight="500" fontSize="25" fill="#0f2b46" letterSpacing="1">
            CARGA
        </text>
        <text x="92" y="66" fontFamily={FONT} fontWeight="500" fontSize="25" fill="#0f2b46" letterSpacing="1">
            GLOBAL
        </text>
    </Svg>
);

export const UltraGlobalLogo = ({ className }: P) => (
    <Svg className={className} label="Ultra Global">
        <path d="M8 62 70 30l-16 30 24-4-34 20 2-14Z" fill="#2aa1e2" />
        <path d="M24 28 44 20l18 8v22L44 58 24 50Z" fill="#e3242b" />
        <path d="M24 28 44 36l18-8M44 36v22" stroke="#fff" strokeWidth="2" fill="none" />
        <text x="76" y="46" fontFamily={FONT} fontWeight="900" fontSize="30" fill="#e3242b" letterSpacing="1">
            ULTRA
        </text>
        <text x="76" y="76" fontFamily={FONT} fontWeight="900" fontSize="30" fill="#1b4fa0" letterSpacing="1">
            GL
        </text>
        <circle cx="140" cy="66" r="11" fill="#2aa1e2" />
        <path d="M133 62c5-3 9 2 13-1M134 70c4 1 6-3 11 0" stroke="#fff" strokeWidth="1.6" fill="none" />
        <text x="154" y="76" fontFamily={FONT} fontWeight="900" fontSize="30" fill="#1b4fa0" letterSpacing="1">
            BAL
        </text>
    </Svg>
);

export const PolycargoLogo = ({ className }: P) => (
    <Svg className={className} label="Polycargo Brasil">
        <path d="M70 12l24 22-24 22-4-6 16-16-16-16Z" fill="#a9bfe3" />
        <path d="M84 8l30 26-30 26-5-7 20-19-20-19Z" fill="#6f92d1" />
        <path d="M100 4l38 30-38 30-6-8 26-22L94 12Z" fill="#1f4e9e" />
        <text x="30" y="80" fontFamily={FONT} fontWeight="800" fontSize="32" fill="#1f4e9e" letterSpacing="-0.5">
            poly
        </text>
        <text x="96" y="80" fontFamily={FONT} fontWeight="900" fontSize="32" fill="#7a7f8a" letterSpacing="-0.5">
            CARGO
        </text>
        <text x="176" y="88" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="8" fill="#7a7f8a" letterSpacing="1">
            BRASIL
        </text>
    </Svg>
);

export const DynamicAirCargoLogo = ({ className }: P) => (
    <Svg className={className} label="Dynamic Air Cargo">
        <path d="M110 4 78 56h64Z" fill="none" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path key={i} d={`M${108 + i * 4} 4 L${72 + i * 9} ${52 - i * 3} L${76 + i * 9} ${58 - i * 3}Z`} fill="#0b1f6b" />
        ))}
        <path d="M108 4h12l-30 56H66Z" fill="#0b1f6b" />
        <text x="110" y="78" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="11.5" fill="#0b1f6b" fontStyle="italic">
            DYNAMIC AIR CARGO CO.,LTD.
        </text>
    </Svg>
);

export const BrandTile = ({ className }: P) => (
    <svg viewBox="0 0 220 90" role="img" aria-label="GlobexiaCorp" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M44 45 56 24h24l12 21-12 21H56Z" fill="#FF5A0A" />
        <path d="M56 24h24l-12 21Z" fill="#FF8A3D" />
        <path d="M56 24 44 45l24 0Z" fill="#E84800" />
        <path d="M68 33 77 38v9l-9 5-9-5v-9Z" fill="#fff" />
        <text x="100" y="53" fontFamily={FONT} fontWeight="500" fontSize="25" fill="#12123f" letterSpacing="-0.5">
            GlobexiaCorp
        </text>
    </svg>
);

export const PARTNERS = [
    { key: "golden", name: "Golden Logistics", Logo: GoldenLogisticsLogo },
    { key: "gls", name: "GLS", Logo: GlsLogo },
    { key: "carga", name: "Carga Global", Logo: CargaGlobalLogo },
    { key: "ilg", name: "International Logistic Gateway", Logo: IlgLogo },
    { key: "ultra", name: "Ultra Global", Logo: UltraGlobalLogo },
    { key: "poly", name: "Polycargo Brasil", Logo: PolycargoLogo },
    { key: "dynamic", name: "Dynamic Air Cargo", Logo: DynamicAirCargoLogo },
] as const;
