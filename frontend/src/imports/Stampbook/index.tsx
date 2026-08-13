import { useState, useEffect, useCallback } from "react";
import * as stampCardsApi from "@/app/api/stampCards";
import type { StampCardResponse } from "@/app/api/stampCards";
import type { RewardTransactionResponse } from "@/app/api/stampCards";
import { useAuth } from "@/app/context/AuthContext";
import svgPaths from "@/imports/StampCard/svg-3vvmtd8stq";

export default function Stampbook({ className }: { className?: string }) {
  const { user } = useAuth();
  const [card, setCard] = useState<StampCardResponse | null>(null);
  const [transactions, setTransactions] = useState<RewardTransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  const fetchCard = useCallback(async () => {
    try {
      const data = await stampCardsApi.getActiveCard();
      setCard(data);
      setError(null);
    } catch (err: any) {
      setCard(null);
      setError(
        err?.response?.data?.message ??
          err?.response?.data?.error ??
          "Failed to load stamp card"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await stampCardsApi.getRewardTransactions();
      setTransactions(data.slice(0, 10));
    } catch {
      setTransactions([]);
    }
  }, []);

  useEffect(() => {
    fetchCard();
    fetchTransactions();
  }, [fetchCard, fetchTransactions]);

  const handleRedeem = useCallback(async () => {
    if (!card || card.totalStamps < 10) return;
    setError(null);
    setRedeeming(true);
    try {
      await stampCardsApi.redeemCard(card.id);
      await fetchCard();
      await fetchTransactions();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.response?.data?.error ??
          "Could not redeem card"
      );
    } finally {
      setRedeeming(false);
    }
  }, [card, fetchCard, fetchTransactions]);

  const defaultClasses =
    "bg-[var(--flowty-paper)] border-[var(--flowty-ink)] border-[1.786px] border-solid overflow-clip relative rounded-[2.382px] shadow-[10px_-1px_2px_0px_var(--flowty-shadow-stamp),2.977px_2.977px_0px_0px_var(--flowty-ink)] h-[320px] w-[343.487px]";

  const canRedeem = card && card.totalStamps >= 10 && !card.redeemed;
  const progressPercent = card ? (card.totalStamps / 10) * 100 : 0;

  return (
    <div className={className || defaultClasses} data-name="Stampbook">
      <div className="absolute bg-[var(--flowty-title-bg)] content-stretch flex gap-[5.955px] h-[34.538px] items-center left-0 pb-[7.741px] pt-[5.955px] px-[9.528px] right-0 top-0" data-name="Title Task rewards">
        <div aria-hidden className="absolute border-[var(--flowty-ink)] border-b-[1.786px] border-solid inset-0 pointer-events-none" />
        <div className="relative shrink-0 w-[88px]" data-name="Container">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
            <div className="relative shrink-0 w-full" data-name="Text">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                <p className="[word-break:break-word] font-['Permanent_Marker:Regular',sans-serif] leading-[13.101px] not-italic relative shrink-0 text-[var(--flowty-ink)] text-[11.91px] whitespace-nowrap">Task REWARDS</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-[1_0_0] h-[20.842px] min-w-px relative" data-name="Container (auto margin alignment)" />
        <div className="relative shrink-0" data-name="Points badge">
          <p className="[word-break:break-word] font-['Share_Tech_Mono:Regular',sans-serif] leading-[11px] not-italic relative shrink-0 text-[var(--flowty-ink)] text-[9px] whitespace-nowrap">
            {user?.totalPoints ?? 0} pts
          </p>
        </div>
      </div>

      <div className="absolute content-stretch flex flex-col items-start left-0 p-[11.91px] top-[36.62px] w-full" data-name="Container">
        <div className="relative shrink-0 w-full" data-name="Container (margin)">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[7.146px] relative size-full">
            <div className="relative shrink-0 w-full" data-name="Container">
              <div aria-hidden className="absolute border-[var(--flowty-gold)] border-l-[1.786px] border-solid inset-0 pointer-events-none" />
              <div className="content-stretch flex flex-col items-start pl-[6.55px] relative size-full">
                <p className="[word-break:break-word] font-['Special_Elite:Regular',sans-serif] leading-[18px] not-italic relative shrink-0 text-[var(--flowty-stamp-label)] text-[12px] w-[463px]">Complete 10 Tasks and receive bonus points!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative shrink-0 w-full" data-name="Container (margin)">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[9.528px] relative size-full">
            {loading ? (
              <div className="h-[78.009px] w-full flex items-center justify-center">
                <p className="font-['Courier_Prime',sans-serif] text-[10px] text-[var(--flowty-text-secondary)]">Loading...</p>
              </div>
            ) : !card ? (
              <div className="h-[78.009px] w-full flex items-center justify-center">
                <p className="font-['Courier_Prime',sans-serif] text-[10px] text-[var(--flowty-text-secondary)]">No card available</p>
              </div>
            ) : (
              <div className="h-[78.009px] relative shrink-0 w-full" data-name="StampGrid">
                {card.slots.map((slot) => (
                  <div
                    key={slot.slotNumber}
                    className="absolute content-stretch flex flex-col gap-[2.382px] items-center"
                    style={{
                      left: `${((slot.slotNumber - 1) % 5) * 57.4}px`,
                      top: slot.slotNumber > 5 ? "41.39px" : "0px",
                      width: "52.645px",
                    }}
                  >
                    <div
                      className={`drop-shadow-[1.191px_1.191px_0px_var(--flowty-ink)] relative rounded-[2.382px] shrink-0 size-[26.201px] ${
                        slot.filled ? "" : "bg-[var(--flowty-paper)]"
                      }`}
                    >
                      {slot.filled ? (
                        <>
                          <div aria-hidden className="absolute bg-[var(--flowty-gold)] bg-clip-padding border-0 border-[transparent] border-solid inset-0 pointer-events-none rounded-[2.382px]" />
                          <div aria-hidden className="absolute border-[var(--flowty-ink)] border-[1.191px] border-solid inset-0 pointer-events-none rounded-[2.382px]" />
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.191px] relative size-full">
                            <div className="relative shrink-0 size-[20.247px]" data-name="Icon">
                              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.2465 20.2465">
                                <g id="Icon">
                                  <path d={svgPaths.p2725fa00} fill="var(--fill-0, var(--flowty-star))" id="Vector" stroke="var(--stroke-0, var(--flowty-stamp-label))" strokeWidth="0.690222" />
                                </g>
                              </svg>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div aria-hidden className="absolute border-[var(--flowty-ink)] border-[1.191px] border-solid inset-0 pointer-events-none rounded-[2.382px]" />
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.191px] relative size-full">
                            <div className="relative rounded-[8.337px] shrink-0 size-[16.674px]">
                              <div aria-hidden className="absolute border-[var(--flowty-empty-slot)] border-[1.191px] border-dashed inset-0 pointer-events-none rounded-[8.337px]" />
                            </div>
                          </div>
                        </>
                      )}
                      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0.595px_1.786px_0px_var(--flowty-shadow-slot)]" />
                    </div>
                    <div className="h-[8.039px] opacity-70 relative shrink-0 w-[5.797px]">
                      <p className="[word-break:break-word] absolute font-['Share_Tech_Mono:Regular',sans-serif] leading-[8.039px] left-0 not-italic text-[var(--flowty-stamp-label)] text-[5.359px] top-[-0.6px] whitespace-nowrap">
                        {String(slot.slotNumber).padStart(2, "0")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative shrink-0 w-full" data-name="Container (margin)">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[9.528px] relative size-full">
            <div className="h-[8.337px] relative rounded-[1.786px] shrink-0 w-full">
              <div aria-hidden className="absolute bg-[var(--flowty-paper)] inset-0 pointer-events-none rounded-[1.786px]" />
              <div className="content-stretch flex flex-col items-start overflow-clip p-[1.191px] relative rounded-[inherit] size-full">
                <div
                  className="bg-gradient-to-r from-[var(--flowty-progress-from)] h-[5.955px] relative shrink-0 to-[var(--flowty-progress-to)]"
                  style={{ width: `${Math.max(progressPercent, card && card.totalStamps > 0 ? 8 : 0)}%` }}
                >
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                    <div className="absolute h-[8.932px] left-[70.86px] top-[-1.49px] w-[9.528px]">
                      <p className="[word-break:break-word] absolute font-['VT323:Regular',sans-serif] leading-[8.932px] left-0 not-italic text-[var(--flowty-paper)] text-[5.955px] top-[-0.6px] whitespace-nowrap">
                        {card ? `${card.totalStamps}/10` : "0/10"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0.595px_1.786px_0px_var(--flowty-shadow-progress)]" />
              <div aria-hidden className="absolute border-[var(--flowty-ink)] border-[1.191px] border-solid inset-0 pointer-events-none rounded-[1.786px]" />
            </div>
          </div>
        </div>

        <div className="relative shrink-0 w-full" data-name="Container (margin)">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[9.528px] relative size-full">
            <div className="h-[23.224px] relative shrink-0 w-full">
              <button
                onClick={handleRedeem}
                disabled={!canRedeem || redeeming}
                className={`absolute content-stretch flex flex-col items-center justify-center left-[92.35px] px-[11.91px] py-[5.359px] rounded-[2.382px] top-0 ${
                  canRedeem && !redeeming
                    ? "bg-[var(--flowty-accent)] cursor-pointer"
                    : "bg-[var(--flowty-paper)] cursor-not-allowed"
                }`}
              >
                <div aria-hidden className="absolute border-[var(--flowty-ink)] border-[1.191px] border-solid inset-0 pointer-events-none rounded-[2.382px]" />
                <p
                  className={`[word-break:break-word] font-['Special_Elite:Regular',sans-serif] leading-[12.505px] not-italic relative shrink-0 text-[8.337px] text-center tracking-[0.5955px] uppercase whitespace-nowrap ${
                    canRedeem && !redeeming ? "text-[var(--flowty-ink)]" : "text-[var(--flowty-disabled)]"
                  }`}
                >
                  {redeeming ? "Redeeming..." : "Redeem Reward"}
                </p>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p className="font-['Courier_Prime',sans-serif] text-[8px] text-[var(--flowty-error)] leading-[10px] mt-[4px]">
            {error}
          </p>
        )}

        {transactions.length > 0 && (
          <div className="relative shrink-0 w-full mt-[4px]" data-name="Transactions">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
              <p className="[word-break:break-word] font-['Share_Tech_Mono:Regular',sans-serif] leading-[10px] not-italic relative shrink-0 text-[var(--flowty-stamp-label)] text-[7px] mb-[3px]">
                RECENT REWARDS
              </p>
              <div className="flex flex-col gap-[1px] w-full max-h-[40px] overflow-y-auto">
                {transactions.slice(0, 4).map((tx) => (
                  <div key={tx.id} className="flex items-center gap-[4px]">
                    <span className="shrink-0 leading-[8px] text-[7px]">
                      {tx.type === "CARD_REDEEMED" ? "🎁" : "⭐"}
                    </span>
                    <p className="[word-break:break-word] font-['Courier_Prime',sans-serif] leading-[9px] not-italic flex-1 min-w-0 relative shrink-0 text-[var(--flowty-text)] text-[7px] truncate">
                      {tx.type === "CARD_REDEEMED"
                        ? `Card redeemed`
                        : tx.habitName
                          ? tx.habitName
                          : "Task completed"}
                    </p>
                    <p className="[word-break:break-word] font-['Share_Tech_Mono:Regular',sans-serif] leading-[9px] not-italic relative shrink-0 text-[var(--flowty-progress-from)] text-[7px] whitespace-nowrap">
                      +{tx.points} pts
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}