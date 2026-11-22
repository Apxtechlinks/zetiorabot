import { Check } from "lucide-react";

import { formatTzs, PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function PlanCards({ currentId, onPick }: { currentId?: string | null; onPick?: (id: string) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {PLANS.map((p) => {
        const current = p.id === currentId;
        return (
          <div
            key={p.id}
            className={cn(
              "flex flex-col rounded-2xl border bg-card p-5 shadow-sm",
              current ? "border-gold ring-2 ring-gold" : "border-border",
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold uppercase tracking-wide text-foreground">{p.name}</h3>
              {current ? (
                <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-gold-foreground">
                  Kifurushi chako
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{p.price === 0 ? "BURE" : formatTzs(p.price)}</p>
            <p className="text-sm text-muted-foreground">{p.durationLabel}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-foreground">
              <li className="flex gap-2"><Check className="h-4 w-4 text-gold" aria-hidden />Bidhaa {p.maxProducts}</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-gold" aria-hidden />Majibu ya AI {p.maxAiReplies.toLocaleString("en-US")}</li>
            </ul>
            {onPick ? (
              <button
                type="button"
                disabled={current}
                onClick={() => onPick(p.id)}
                className="mt-5 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground disabled:opacity-50"
              >
                {current ? "Unatumia sasa" : "Chagua"}
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
