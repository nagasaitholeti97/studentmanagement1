import { useState } from "react";
import { COLLEGE } from "../config";

/** College logo + name + address. "login" is the big centred version for the sign-in page, "banner" is for dashboards. */
export default function CollegeBanner({ variant = "banner" }: { variant?: "banner" | "login" }) {
    const [logoOk, setLogoOk] = useState(true);
    const login = variant === "login";

    return (
        <div className={login ? "flex flex-col items-center gap-6 text-center" : "card mb-4 flex items-center gap-5"}>
            {logoOk && (
                <img
                    src={COLLEGE.logo}
                    alt=""
                    onError={() => setLogoOk(false)}
                    className={login
                        ? "h-36 w-36 shrink-0 rounded-3xl bg-white object-contain p-3 md:h-44 md:w-44"
                        : "h-24 w-24 shrink-0 object-contain md:h-28 md:w-28"}
                />
            )}
            <div>
                <p className={login ? "text-3xl font-extrabold leading-tight text-white md:text-4xl" : "text-xl font-extrabold text-blue-900 md:text-2xl"}>{COLLEGE.name}</p>
                <p className={login ? "mt-2 text-base text-blue-100" : "text-xs text-slate-600 md:text-sm"}>{COLLEGE.address}</p>
            </div>
        </div>
    );
}