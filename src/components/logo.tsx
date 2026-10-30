import { Sprite } from "@/components/sprite";
import { MASCOT, MASCOT_COLORS } from "@/components/sprites";

/** `pixel` switches the wordmark to the pixel display font (landing page only). */
export function Logo({ pixel = false, light = false }: { pixel?: boolean; light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <Sprite grid={MASCOT} colors={MASCOT_COLORS} scale={2} />
      <span
        className={
          (pixel ? "font-pixel text-[13px] tracking-tight " : "text-xl font-bold tracking-tight ") +
          (light ? "text-arctic" : "text-noir")
        }
      >
        mindbase
      </span>
    </span>
  );
}
