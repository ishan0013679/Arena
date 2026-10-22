import { Plus } from "lucide-react";

import { RippleButton, RippleButtonRipples } from "@/components/animate-ui/components/buttons/ripple";

import { PrizeList } from "./prize-list";
import { RuleList } from "./rule-list";
import type { Prize, Rule, TournamentErrors } from "./tournament-wizard-types";

export function PrizesRulesStep({
  prizes,
  rules,
  errors,
  onAddPrize,
  onRemovePrize,
  onUpdatePrize,
  onAddRule,
  onRemoveRule,
  onUpdateRule,
}: {
  prizes: Prize[];
  rules: Rule[];
  errors: TournamentErrors;
  onAddPrize: () => void;
  onRemovePrize: (id: string) => void;
  onUpdatePrize: (id: string, patch: Partial<Prize>) => void;
  onAddRule: () => void;
  onRemoveRule: (id: string) => void;
  onUpdateRule: (id: string, patch: Partial<Rule>) => void;
}) {
  return (
    <div className="space-y-9">
      <section aria-labelledby="prizes-heading">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 id="prizes-heading" className="font-display text-xl font-black tracking-[-0.04em]">
              Prizes <span className="font-body text-sm font-normal text-muted-foreground">(optional)</span>
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">Define prizes by finishing place.</p>
          </div>
          <RippleButton type="button" variant="outline" onClick={onAddPrize} hoverScale={1.01} tapScale={0.98}>
            <Plus aria-hidden="true" />Add prize<RippleButtonRipples />
          </RippleButton>
        </div>
        <PrizeList prizes={prizes} errors={errors} onRemove={onRemovePrize} onChange={onUpdatePrize} />
      </section>

      <section aria-labelledby="rules-heading" className="border-t border-border pt-7">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 id="rules-heading" className="font-display text-xl font-black tracking-[-0.04em]">
              Tournament rules <span className="font-body text-sm font-normal text-muted-foreground">(optional)</span>
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">Add rules in the order participants should read them.</p>
          </div>
          <RippleButton type="button" variant="outline" onClick={onAddRule} hoverScale={1.01} tapScale={0.98}>
            <Plus aria-hidden="true" />Add rule<RippleButtonRipples />
          </RippleButton>
        </div>
        <RuleList rules={rules} errors={errors} onRemove={onRemoveRule} onChange={onUpdateRule} />
      </section>
    </div>
  );
}
