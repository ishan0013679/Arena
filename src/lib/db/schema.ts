// Drizzle schema entry point.
// Application tables and their Drizzle schema definitions.

import {
  boolean,
  check,
  foreignKey,
  integer,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { AnyPgColumn, PgTableExtraConfigValue } from "drizzle-orm/pg-core";
import { defineRelations, sql } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const gameStatusEnum = pgEnum("game_status", [
  "active",
  "coming_soon",
  "inactive",
  "archived",
]);

export const tournamentFormatEnum = pgEnum("tournament_format", [
  "single_stage",
  "multi_stage",
]);

export const tournamentStatusEnum = pgEnum("tournament_status", [
  "draft",
  "upcoming",
  "registration_open",
  "registration_closed",
  "live",
  "completed",
  "cancelled",
]);

export const tournamentPrizeTypeEnum = pgEnum("tournament_prize_type", [
  "cash",
  "physical_goods",
  "coupon",
  "other",
]);

export const tournamentRuleVersionStatusEnum = pgEnum(
  "tournament_rule_version_status",
  ["draft", "published"],
);

export const tournamentRuleCategoryEnum = pgEnum("tournament_rule_category", [
  "eligibility",
  "gameplay",
  "conduct",
  "technical",
  "other",
]);

export const tournamentRuleSeverityEnum = pgEnum("tournament_rule_severity", [
  "info",
  "minor",
  "major",
  "critical",
]);

export const tournamentRulePenaltyPolicyEnum = pgEnum(
  "tournament_rule_penalty_policy",
  ["none", "warning", "point_deduction", "match_forfeit", "disqualification", "other"],
);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").notNull().unique(),
    username: text("username").unique(),
    role: roleEnum("role").notNull().default("user"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
);

export const games = pgTable(
  "games",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    short_name: text("short_name"),
    description: text("description"),
    developer: text("developer"),
    publisher: text("publisher"),
    icon_url: text("icon_url"),
    logo_url: text("logo_url"),
    banner_url: text("banner_url"),
    status: gameStatusEnum("status").notNull().default("active"),
    is_featured: boolean("is_featured").notNull().default(false),
    sort_order: integer("sort_order").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
);

export const gameModes = pgTable(
  "game_modes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    game_id: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    max_players_per_match: integer("max_players_per_match").notNull(),
    active: boolean("active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Fast lookups of all modes for a game (also supports the unique slug check)
    index("game_modes_game_id_idx").on(table.game_id),
    // Slug must be unique within a game, not globally
    uniqueIndex("game_modes_game_id_slug_unique").on(table.game_id, table.slug),
  ],
);

export const modeTeamConfigurations = pgTable(
  "mode_team_configurations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    mode_id: uuid("mode_id")
      .notNull()
      .references(() => gameModes.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    team_size: integer("team_size").notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // A given team size may only appear once per mode (e.g. no duplicate "Solo")
    uniqueIndex("mode_team_configurations_mode_id_team_size_unique").on(
      table.mode_id,
      table.team_size,
    ),
  ],
);

export const tournaments = pgTable(
  "tournaments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    mode_team_configuration_id: uuid("mode_team_configuration_id")
      .notNull()
      .references(() => modeTeamConfigurations.id, { onDelete: "restrict" }),
    tournament_format: tournamentFormatEnum("tournament_format").notNull(),
    status: tournamentStatusEnum("status").notNull().default("draft"),
    max_entries: integer("max_entries").notNull(),
    registration_opens_at: timestamp("registration_opens_at", {
      withTimezone: true,
    }).notNull(),
    registration_closes_at: timestamp("registration_closes_at", {
      withTimezone: true,
    }).notNull(),
    starts_at: timestamp("starts_at", { withTimezone: true }).notNull(),
    ends_at: timestamp("ends_at", { withTimezone: true }),
    prize_summary: text("prize_summary"),
    // The FK below allows NULL for draft tournaments; when set, it requires
    // the rule version to belong to this tournament. Published status remains
    // a server-side publication check.
    published_rules_version_id: uuid("published_rules_version_id"),
    banner_url: text("banner_url"),
    created_by: uuid("created_by")
      .notNull()
      .references(() => profiles.user_id, { onDelete: "restrict" }),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table): PgTableExtraConfigValue[] => [
    foreignKey({
      name: "tournament_published_rules_fk",
      columns: [table.published_rules_version_id],
      foreignColumns: [tournamentRuleVersions.id as AnyPgColumn],
    }).onDelete("restrict"),
    foreignKey({
      name: "tournaments_published_rules_version_ownership_fk",
      columns: [table.id, table.published_rules_version_id],
      foreignColumns: [
        tournamentRuleVersions.tournament_id as AnyPgColumn,
        tournamentRuleVersions.id as AnyPgColumn,
      ],
    }).onDelete("restrict"),
    check("tournaments_max_entries_positive_check", sql`${table.max_entries} > 0`),
    check(
      "tournaments_registration_window_check",
      sql`${table.registration_opens_at} < ${table.registration_closes_at}`,
    ),
    check(
      "tournaments_start_after_registration_check",
      sql`${table.registration_closes_at} <= ${table.starts_at}`,
    ),
    check(
      "tournaments_end_after_start_check",
      sql`${table.ends_at} is null or ${table.ends_at} >= ${table.starts_at}`,
    ),
    index("tournaments_mode_team_configuration_id_idx").on(
      table.mode_team_configuration_id,
    ),
    index("tournaments_published_rules_version_id_idx").on(
      table.published_rules_version_id,
    ),
    index("tournaments_created_by_idx").on(table.created_by),
    index("tournaments_status_registration_opens_at_idx").on(
      table.status,
      table.registration_opens_at,
    ),
  ],
);

export const tournamentPrizes = pgTable(
  "tournament_prizes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tournament_id: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "restrict" }),
    place: integer("place").notNull(),
    prize_type: tournamentPrizeTypeEnum("prize_type").notNull(),
    description: text("description").notNull(),
    cash_amount: numeric("cash_amount", { precision: 12, scale: 2 }),
    currency: text("currency"),
    quantity: integer("quantity"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check("tournament_prizes_place_positive_check", sql`${table.place} > 0`),
    check(
      "tournament_prizes_quantity_positive_check",
      sql`${table.quantity} is null or ${table.quantity} > 0`,
    ),
    check(
      "tournament_prizes_cash_fields_check",
      sql`(${table.prize_type} = 'cash' and ${table.cash_amount} is not null and ${table.cash_amount} >= 0 and ${table.currency} ~ '^[A-Z]{3}$') or (${table.prize_type} <> 'cash' and ${table.cash_amount} is null and ${table.currency} is null)`,
    ),
    index("tournament_prizes_tournament_id_idx").on(table.tournament_id),
  ],
);

export const tournamentRuleVersions = pgTable(
  "tournament_rule_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tournament_id: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "restrict" }),
    version_number: integer("version_number").notNull(),
    // Published versions and their rules must be immutable; future server-side
    // write operations enforce this. No database trigger is added in this phase.
    status: tournamentRuleVersionStatusEnum("status")
      .notNull()
      .default("draft"),
    published_at: timestamp("published_at", { withTimezone: true }),
    published_by: uuid("published_by").references(() => profiles.user_id, {
      onDelete: "restrict",
    }),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table): PgTableExtraConfigValue[] => [
    check(
      "tournament_rule_versions_number_positive_check",
      sql`${table.version_number} > 0`,
    ),
    check(
      "tournament_rule_versions_publication_fields_check",
      sql`(${table.status} = 'draft' and ${table.published_at} is null and ${table.published_by} is null) or (${table.status} = 'published' and ${table.published_at} is not null and ${table.published_by} is not null)`,
    ),
    uniqueIndex("tournament_rule_versions_tournament_version_unique").on(
      table.tournament_id,
      table.version_number,
    ),
    // Candidate key required by tournaments' ownership-checking composite FK.
    uniqueIndex("tournament_rule_versions_tournament_id_id_unique").on(
      table.tournament_id,
      table.id,
    ),
  ],
);

export const tournamentRules = pgTable(
  "tournament_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    rule_version_id: uuid("rule_version_id").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: tournamentRuleCategoryEnum("category").notNull(),
    severity: tournamentRuleSeverityEnum("severity").notNull(),
    penalty_policy: tournamentRulePenaltyPolicyEnum("penalty_policy").notNull(),
    display_order: integer("display_order").notNull(),
  },
  (table) => [
    foreignKey({
      name: "tournament_rules_version_fk",
      columns: [table.rule_version_id],
      foreignColumns: [tournamentRuleVersions.id],
    }).onDelete("restrict"),
    check(
      "tournament_rules_display_order_nonnegative_check",
      sql`${table.display_order} >= 0`,
    ),
    uniqueIndex("tournament_rules_version_display_order_unique").on(
      table.rule_version_id,
      table.display_order,
    ),
  ],
);

export const tournamentRuleAcceptances = pgTable(
  "tournament_rule_acceptances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    rule_version_id: uuid("rule_version_id").notNull(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => profiles.user_id, { onDelete: "restrict" }),
    accepted_at: timestamp("accepted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      name: "tournament_rule_acceptances_version_fk",
      columns: [table.rule_version_id],
      foreignColumns: [tournamentRuleVersions.id],
    }).onDelete("restrict"),
    uniqueIndex("tournament_rule_acceptances_user_version_unique").on(
      table.user_id,
      table.rule_version_id,
    ),
    index("tournament_rule_acceptances_rule_version_id_idx").on(
      table.rule_version_id,
    ),
  ],
);

// ---------------------------------------------------------------------------
// Drizzle relations
// ---------------------------------------------------------------------------

export const relations = defineRelations(
  {
    games,
    gameModes,
    modeTeamConfigurations,
    tournaments,
    tournamentPrizes,
    tournamentRuleVersions,
    tournamentRules,
    tournamentRuleAcceptances,
    profiles,
  },
  (r) => ({
    games: {
      modes: r.many.gameModes(),
    },
    gameModes: {
      game: r.one.games({ from: r.gameModes.game_id, to: r.games.id }),
      teamConfigurations: r.many.modeTeamConfigurations(),
    },
    modeTeamConfigurations: {
      mode: r.one.gameModes({
        from: r.modeTeamConfigurations.mode_id,
        to: r.gameModes.id,
      }),
    },
    tournaments: {
      teamConfiguration: r.one.modeTeamConfigurations({
        from: r.tournaments.mode_team_configuration_id,
        to: r.modeTeamConfigurations.id,
      }),
      creator: r.one.profiles({
        from: r.tournaments.created_by,
        to: r.profiles.user_id,
      }),
      ruleVersions: r.many.tournamentRuleVersions({
        alias: "tournamentRuleVersions",
      }),
      prizes: r.many.tournamentPrizes(),
    },
    tournamentPrizes: {
      tournament: r.one.tournaments({
        from: r.tournamentPrizes.tournament_id,
        to: r.tournaments.id,
      }),
    },
    tournamentRuleVersions: {
      tournament: r.one.tournaments({
        from: r.tournamentRuleVersions.tournament_id,
        to: r.tournaments.id,
        alias: "tournamentRuleVersions",
      }),
      publishedBy: r.one.profiles({
        from: r.tournamentRuleVersions.published_by,
        to: r.profiles.user_id,
      }),
      rules: r.many.tournamentRules(),
      acceptances: r.many.tournamentRuleAcceptances(),
    },
    tournamentRules: {
      version: r.one.tournamentRuleVersions({
        from: r.tournamentRules.rule_version_id,
        to: r.tournamentRuleVersions.id,
      }),
    },
    tournamentRuleAcceptances: {
      version: r.one.tournamentRuleVersions({
        from: r.tournamentRuleAcceptances.rule_version_id,
        to: r.tournamentRuleVersions.id,
      }),
      user: r.one.profiles({
        from: r.tournamentRuleAcceptances.user_id,
        to: r.profiles.user_id,
      }),
    },
  }),
);

// ---------------------------------------------------------------------------
// Inferred TypeScript types
// ---------------------------------------------------------------------------

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

export type GameMode = typeof gameModes.$inferSelect;
export type NewGameMode = typeof gameModes.$inferInsert;

export type ModeTeamConfiguration = typeof modeTeamConfigurations.$inferSelect;
export type NewModeTeamConfiguration = typeof modeTeamConfigurations.$inferInsert;

export type Tournament = typeof tournaments.$inferSelect;
export type NewTournament = typeof tournaments.$inferInsert;
export type TournamentPrize = typeof tournamentPrizes.$inferSelect;
export type NewTournamentPrize = typeof tournamentPrizes.$inferInsert;
export type TournamentRuleVersion = typeof tournamentRuleVersions.$inferSelect;
export type NewTournamentRuleVersion = typeof tournamentRuleVersions.$inferInsert;
export type TournamentRule = typeof tournamentRules.$inferSelect;
export type NewTournamentRule = typeof tournamentRules.$inferInsert;
export type TournamentRuleAcceptance = typeof tournamentRuleAcceptances.$inferSelect;
export type NewTournamentRuleAcceptance = typeof tournamentRuleAcceptances.$inferInsert;
