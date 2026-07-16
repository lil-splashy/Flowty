import svgPaths from "./svg-za30mkouo1";

export default function LoginButton({ className }: { className?: string }) {
  return (
    <div className={className || "drop-shadow-[3px_2px_1px_rgba(0,0,0,0.6)] h-[42px] relative w-[111px]"} data-name="Login-Button">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 111 42">
        <path d={svgPaths.p16bc2900} fill="var(--fill-0, #E7E1AF)" id="page bg" stroke="var(--stroke-0, black)" strokeWidth="2" />
      </svg>
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 111 42">
        <g id="Mask group">
          <mask height="42" id="mask0_1_362" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="111" x="0" y="0">
            <path d={svgPaths.p16bc2900} fill="var(--fill-0, #E7E1AF)" id="poly mask" stroke="var(--stroke-0, black)" strokeWidth="2" />
          </mask>
          <g mask="url(#mask0_1_362)">
            <path d={svgPaths.p1a70bd97} id="page Lines" stroke="var(--stroke-0, #5EE7F9)" strokeOpacity="0.4" />
          </g>
        </g>
      </svg>
      <p className="[word-break:break-word] absolute font-['American_Typewriter:Bold',sans-serif] inset-[20.2%_18.87%_20.2%_18.99%] leading-[normal] not-italic text-[20px] text-black">Log In</p>
    </div>
  );
}