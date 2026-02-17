import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
};

function isMobileUA(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isLandscape(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(orientation: landscape)").matches;
}

export function RequireLandscape(props: Props) {
  const [needsLandscape, setNeedsLandscape] = useState(false);

  useEffect(() => {
    const update = () => {
      const mobile = isMobileUA();
      const landscape = isLandscape();
      setNeedsLandscape(mobile && !landscape);
    };

    update();

    const mq = window.matchMedia("(orientation: landscape)");

    const onChange = () => update();

    // Preferred modern API
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
    } else {
      // Extremely old Safari fallback (typed safely via structural cast)
      (mq as unknown as { addListener: (cb: () => void) => void }).addListener(
        onChange,
      );
    }

    window.addEventListener("resize", update);

    return () => {
      if (typeof mq.removeEventListener === "function") {
        mq.removeEventListener("change", onChange);
      } else {
        (
          mq as unknown as { removeListener: (cb: () => void) => void }
        ).removeListener(onChange);
      }

      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="relative">
      {props.children}

      {needsLandscape ? (
        <div className="absolute inset-0 z-50 grid place-items-center bg-neutral-950/95 px-6 text-center">
          <div className="max-w-sm rounded-2xl border border-neutral-800 bg-neutral-950 px-6 py-6">
            <div className="text-[11px] tracking-[0.28em] text-neutral-500">
              ORIENTATION
            </div>
            <div className="mt-3 text-lg font-semibold text-neutral-100">
              Ruota il telefono
            </div>
            <div className="mt-2 text-sm text-neutral-400">
              Per usare al meglio il diagramma, questa macchina richiede la
              modalità <span className="text-neutral-200">orizzontale</span>.
            </div>

            <div className="mt-5 flex items-center justify-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-200">
                ↻
              </div>
              <div className="text-[11px] tracking-[0.22em] text-neutral-500">
                LANDSCAPE REQUIRED
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
