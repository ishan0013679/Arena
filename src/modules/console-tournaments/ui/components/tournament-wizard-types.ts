export type PrizeType = "" | "cash" | "physical_goods" | "coupon" | "other";
export type RuleCategory = "" | "eligibility" | "gameplay" | "conduct" | "technical" | "other";
export type RuleSeverity = "" | "info" | "minor" | "major" | "critical";
export type Penalty = "" | "none" | "warning" | "point_deduction" | "match_forfeit" | "disqualification" | "other";

export type Prize = {
  id: string;
  place: string;
  prize_type: PrizeType;
  description: string;
  cash_amount: string;
  currency: string;
  quantity: string;
};

export type Rule = {
  id: string;
  title: string;
  description: string;
  category: RuleCategory;
  severity: RuleSeverity;
  penalty_policy: Penalty;
};

export type TournamentForm = {
  name: string;
  slug: string;
  description: string;
  tournament_format: "single_stage" | "multi_stage" | "";
  game_id: string;
  mode_team_configuration_id: string;
  max_entries: string;
  registration_opens_at: string;
  registration_closes_at: string;
  starts_at: string;
  ends_at: string;
  prizes: Prize[];
  rules: Rule[];
};

export type TournamentErrors = Record<string, string>;
export type UpdateField = <K extends keyof TournamentForm>(key: K, value: TournamentForm[K]) => void;

export const tournamentSteps = [
  "Basic details",
  "Game & teams",
  "Registration & schedule",
  "Prizes & rules",
  "Review",
] as const;

export const stepDescriptions = [
  "Give your tournament a name and choose its format.",
  "Choose a game and a team configuration supported by that game.",
  "Set entry capacity and the event timeline.",
  "Add optional prizes and the rules participants will follow.",
  "Check every section before keeping this as a draft.",
] as const;

export const optionLabels: Record<string, string> = {
  single_stage: "Single stage",
  multi_stage: "Multi-stage",
  cash: "Cash",
  physical_goods: "Physical goods",
  coupon: "Coupon",
  other: "Other",
  eligibility: "Eligibility",
  gameplay: "Gameplay",
  conduct: "Conduct",
  technical: "Technical",
  info: "Info",
  minor: "Minor",
  major: "Major",
  critical: "Critical",
  none: "No penalty",
  warning: "Warning",
  point_deduction: "Point deduction",
  match_forfeit: "Match forfeit",
  disqualification: "Disqualification",
};

export const emptyTournamentForm: TournamentForm = {
  name: "",
  slug: "",
  description: "",
  tournament_format: "",
  game_id: "",
  mode_team_configuration_id: "",
  max_entries: "",
  registration_opens_at: "",
  registration_closes_at: "",
  starts_at: "",
  ends_at: "",
  prizes: [],
  rules: [],
};

export function slugify(value: string) {
  return value.toLowerCase().trim().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function createPrize(): Prize {
  return {
    id: crypto.randomUUID(),
    place: "",
    prize_type: "",
    description: "",
    cash_amount: "",
    currency: "",
    quantity: "",
  };
}

export function createRule(): Rule {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    category: "",
    severity: "",
    penalty_policy: "",
  };
}

export function validateTournament(form: TournamentForm, step: number): TournamentErrors {
  const errors: TournamentErrors = {};
  const add = (key: string, message: string) => { errors[key] = message; };

  if (step === 0 || step === -1) {
    if (!form.name.trim()) add("name", "Enter a tournament name.");
    if (!form.slug.trim()) add("slug", "Enter a slug.");
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
      add("slug", "Use lowercase letters and numbers separated by single hyphens.");
    }
    if (form.tournament_format !== "single_stage" && form.tournament_format !== "multi_stage") {
      add("tournament_format", "Choose a tournament format.");
    }
  }

  if (step === 1 || step === -1) {
    if (!form.game_id) add("game_id", "Choose a game.");
    if (!form.mode_team_configuration_id) {
      add("mode_team_configuration_id", "Choose a team configuration.");
    }
  }

  if (step === 2 || step === -1) {
    if (!/^\d+$/.test(form.max_entries) || Number(form.max_entries) < 1 || Number(form.max_entries) > 2147483647) {
      add("max_entries", "Enter a positive whole number within the supported range.");
    }
    const open = form.registration_opens_at;
    const close = form.registration_closes_at;
    const start = form.starts_at;
    if (!open) add("registration_opens_at", "Choose when registration opens.");
    if (!close) add("registration_closes_at", "Choose when registration closes.");
    if (!start) add("starts_at", "Choose when the tournament starts.");
    if (open && close && open >= close) {
      add("registration_closes_at", "Registration must close after it opens.");
    }
    if (close && start && close > start) {
      add("starts_at", "The tournament must start at or after registration closes.");
    }
    if (form.ends_at && start && form.ends_at < start) {
      add("ends_at", "The end time cannot be before the start.");
    }
  }

  if (step === 3 || step === -1) {
    form.prizes.forEach((prize) => {
      const prefix = `prizes.${prize.id}`;
      if (!prize.prize_type) add(`${prefix}.prize_type`, "Choose a prize type.");
      if (!/^\d+$/.test(prize.place) || Number(prize.place) < 1 || Number(prize.place) > 2147483647) {
        add(`${prefix}.place`, "Place must be a positive whole number within the supported range.");
      }
      if (!prize.description.trim()) add(`${prefix}.description`, "Enter a prize description.");
      if (prize.prize_type === "cash") {
        if (prize.cash_amount === "" || !Number.isFinite(Number(prize.cash_amount)) || Number(prize.cash_amount) < 0 || Number(prize.cash_amount) > 9999999999.99 || !/^\d+(?:\.\d{1,2})?$/.test(prize.cash_amount)) {
          add(`${prefix}.cash_amount`, "Enter an amount from 0 to 9,999,999,999.99, up to two decimal places.");
        }
        if (!/^[A-Z]{3}$/.test(prize.currency)) {
          add(`${prefix}.currency`, "Use a three-letter uppercase currency code.");
        }
      }
      if (prize.quantity && (!/^\d+$/.test(prize.quantity) || Number(prize.quantity) < 1 || Number(prize.quantity) > 2147483647)) {
        add(`${prefix}.quantity`, "Quantity must be a positive whole number within the supported range.");
      }
    });

    form.rules.forEach((rule) => {
      const prefix = `rules.${rule.id}`;
      if (!rule.title.trim()) add(`${prefix}.title`, "Enter a rule title.");
      if (!rule.description.trim()) add(`${prefix}.description`, "Enter a rule description.");
      if (!rule.category) add(`${prefix}.category`, "Choose a category.");
      if (!rule.severity) add(`${prefix}.severity`, "Choose a severity.");
      if (!rule.penalty_policy) add(`${prefix}.penalty_policy`, "Choose a penalty policy.");
    });
  }

  return errors;
}
