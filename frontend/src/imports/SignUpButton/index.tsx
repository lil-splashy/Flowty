import svgPaths from "./svg-ol0oqt27x7";

export default function SignUpButton() {
  return (
    <div className="border-0 border-black border-solid relative shadow-[3px_2px_2px_0px_rgba(0,0,0,0.6)] size-full" data-name="sign up-Button">
      <div className="absolute inset-[0_2.45%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 105.567 42">
          <path d={svgPaths.p558d500} fill="var(--fill-0, #E7E1AF)" id="page bg" stroke="var(--stroke-0, black)" strokeWidth="2" />
        </svg>
      </div>
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 111 42">
        <g id="Mask group">
          <mask height="42" id="mask0_1_375" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="107" x="2" y="0">
            <path d={svgPaths.p261e4ff0} fill="var(--fill-0, #E7E1AF)" id="poly mask" stroke="var(--stroke-0, black)" strokeWidth="2" />
          </mask>
          <g mask="url(#mask0_1_375)">
            <path d={svgPaths.p1a70bd97} id="page Lines" stroke="var(--stroke-0, #5EE7F9)" strokeOpacity="0.4" />
          </g>
        </g>
      </svg>
      <p className="[word-break:break-word] absolute font-['American_Typewriter:Bold',sans-serif] inset-[20.2%_18.87%_20.2%_18.99%] leading-[normal] not-italic text-[16px] text-black">Sign Up</p>
    </div>
  );
}