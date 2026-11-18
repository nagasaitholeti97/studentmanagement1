import { COLLEGE } from "../config";

/** Big faded logo behind a page. The parent must have "relative overflow-hidden"; page content needs "relative". */
export default function Watermark() {
    return (
        <img
            src={COLLEGE.logo}
            alt=""
            aria-hidden
            onError={(e) => (e.currentTarget.style.display = "none")}
            className="pointer-events-none absolute inset-0 m-auto w-4/5 max-w-lg select-none opacity-[0.09]"
        />
    );
}