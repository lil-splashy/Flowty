import svgPaths from "./svg-3vvmtd8stq";
import { useState, useEffect, useCallback } from "react";
import * as stampCardsApi from "@/app/api/stampCards";
import type { StampCardResponse } from "@/app/api/stampCards";

const MAX_SLOTS = 10;
const STAR_PATH =
  "M10.12 1.2 L12.63 7.65 L19.55 8.0 L14.12 12.35 L15.92 19.05 L10.12 15.2 L4.32 19.05 L6.12 12.35 L0.69 8.0 L7.61 7.65 Z";

function StampSlot({ filled, index }: { filled: boolean; index: number }) {
  const label = String(index + 1).padStart(2, "0");
  return (
    <div className="flex flex-col gap-[2.382px] items-center">
      <div
        className={`drop-shadow-[1.191px_1.191px_0px_#1a1a2e] relative rounded-[2.382px] shrink-0 size-[26.201px] transition-colors ${
          filled ? "bg-[#c8a84b]" : "bg-[#e7e1af]"
        }`}
      >
        <div
          aria-hidden
          className="absolute border-[#1a1a2e] border-[1.191px] border-solid inset-0 pointer-events-none rounded-[2.382px]"
        />
        <div className="flex items-center justify-center p-[1.191px] relative size-full">
          {filled ? (
            <div className="relative shrink-0 size-[20.247px]">
              <svg
                className="absolute block inset-0 size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 20.2465 20.2465"
              >
                <path
                  d={svgPaths.p2725fa00}
                  fill="#8B6914"
                  stroke="#5A4008"
                  strokeWidth="0.690222"
                />
              </svg>
            </div>
          ) : (
            <div className="relative rounded-[8.337px] shrink-0 size-[16.674px]">
              <div
                aria-hidden
                className="absolute border-[#aaa09a] border-[1.191px] border-dashed inset-0 pointer-events-none rounded-[8.337px]"
              />
            </div>
          )}
        </div>
        {filled && (
          <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0.595px_1.786px_0px_rgba(0,0,0,0.3)]" />
        )}
      </div>
      <p className="font-['Share_Tech_Mono:Regular',sans-serif] leading-[8.039px] not-italic text-[#5a4008] text-[5.359px] opacity-70 whitespace-nowrap">
        {label}
      </p>
    </div>
  );
}

export default function StampCard() {
  const [card, setCard] = useState<StampCardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCard = useCallback(async () => {
    try {
      const data = await stampCardsApi.getActiveCard();
      setCard(data);
    } catch {
      setCard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCard();
    const handler = () => fetchCard();
    window.addEventListener("flowty:rewards-updated", handler);
    return () => window.removeEventListener("flowty:rewards-updated", handler);
  }, [fetchCard]);

  const handleRedeem = useCallback(async () => {
    if (!card || card.totalStamps < MAX_SLOTS || card.redeemed) return;
    try {
      await stampCardsApi.redeemCard(card.id);
      await fetchCard();
    } catch {}
  }, [card, fetchCard]);

  const total = card?.totalStamps ?? 0;
  const canRedeem = total >= MAX_SLOTS && !card?.redeemed;
  const percent = Math.min(100, (total / MAX_SLOTS) * 100);

  const slots = Array.from({ length: MAX_SLOTS }, (_, i) => {
    const slot = card?.slots?.find((s) => s.slotNumber === i + 1);
    return slot ? slot.filled : false;
  });

  return (
    <div
      className="bg-[#e7e1af] border-[#1a1a2e] border-[1.786px] border-solid overflow-clip relative rounded-[2.382px] shadow-[10px_-1px_2px_0px_rgba(0,0,0,0.42),2.977px_2.977px_0px_0px_#1a1a2e] size-full"
      data-name="StampCard"
    >
      <div className="absolute bg-[#c5f06a] flex gap-[5.955px] h-[34.538px] items-center left-0 pb-[7.741px] pt-[5.955px] px-[9.528px] right-0 top-0">
        <div
          aria-hidden
          className="absolute border-[#1a1a2e] border-b-[1.786px] border-solid inset-0 pointer-events-none"
        />
        <p className="font-['Permanent_Marker:Regular',sans-serif] leading-[13.101px] not-italic text-[#1a1a2e] text-[11.91px] whitespace-nowrap">
          Task REWARDS
        </p>
        <div className="flex-[1_0_0] min-w-px" />
        {card?.redeemed && (
          <p className="font-['Share_Tech_Mono:Regular',sans-serif] text-[#1a1a2e] text-[7px] whitespace-nowrap">
            REDEEMED
          </p>
        )}
      </div>

      <div className="absolute flex flex-col items-start left-0 p-[11.91px] top-[36.62px] w-full">
        <div className="pt-[7.146px] w-full">
          <div className="relative w-full">
            <div
              aria-hidden
              className="absolute border-[#c8a84b] border-l-[1.786px] border-solid inset-0 pointer-events-none"
            />
            <div className="flex flex-col items-start pl-[6.55px]">
              <p className="font-['Special_Elite:Regular',sans-serif] leading-[18px] not-italic text-[#5a4008] text-[12px]">
                Complete {MAX_SLOTS} Tasks and receive bonus points!
              </p>
            </div>
          </div>
        </div>

        <div className="pt-[9.528px] w-full">
          {loading ? (
            <div className="grid grid-cols-5 gap-x-[5px] gap-y-[7px]">
              {Array.from({ length: MAX_SLOTS }).map((_, i) => (
                <div
                  key={i}
                  className="size-[26.201px] rounded-[2.382px] bg-[rgba(0,0,0,0.06)] animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-x-[5px] gap-y-[7px]">
              {slots.map((filled, i) => (
                <StampSlot key={i} filled={filled} index={i} />
              ))}
            </div>
          )}
        </div>

        <div className="pt-[9.528px] w-full">
          <div className="h-[8.337px] relative rounded-[1.786px] w-full">
            <div
              aria-hidden
              className="absolute bg-[#e7e1af] inset-0 pointer-events-none rounded-[1.786px]"
            />
            <div className="flex flex-col items-start overflow-clip p-[1.191px] relative rounded-[inherit] size-full">
              <div
                className="bg-gradient-to-r from-[#4a7abf] h-[5.955px] relative to-[#6899d8] transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="font-['VT323:Regular',sans-serif] leading-[8.932px] not-italic text-[#1a1a2e] text-[5.955px] whitespace-nowrap">
                {total}/{MAX_SLOTS}
              </p>
            </div>
            <div
              aria-hidden
              className="absolute border-[#1a1a2e] border-[1.191px] border-solid inset-0 pointer-events-none rounded-[1.786px]"
            />
          </div>
        </div>

        <div className="pt-[9.528px] w-full flex justify-center">
          <button
            onClick={handleRedeem}
            disabled={!canRedeem}
            className={`bg-[#e7e1af] flex flex-col items-center justify-center px-[11.91px] py-[5.359px] rounded-[2.382px] relative ${
              canRedeem
                ? "hover:bg-[#d5cf9e] cursor-pointer"
                : "cursor-not-allowed"
            }`}
          >
            <div
              aria-hidden
              className="absolute border-[#1a1a2e] border-[1.191px] border-solid inset-0 pointer-events-none rounded-[2.382px]"
            />
            <p
              className={`font-['Special_Elite:Regular',sans-serif] leading-[12.505px] not-italic text-[8.337px] text-center tracking-[0.5955px] uppercase whitespace-nowrap ${
                canRedeem ? "text-[#1a1a2e]" : "text-[#888]"
              }`}
            >
              Redeem Reward
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
