import Image from "next/image";
import { Gamepad2 } from "lucide-react";

import type { Game } from "@/modules/games/queries/games";
import type { GameMode, ModeTeamConfiguration } from "@/modules/games/queries/modes";

import { RadioCardGroup } from "./tournament-wizard-fields";
import type { TournamentErrors } from "./tournament-wizard-types";

export function GameTeamStep({
  games,
  modes,
  configurations,
  selectedGameId,
  selectedModeId,
  selectedConfigurationId,
  errors,
  gamesLoading,
  gamesError,
  modesLoading,
  modesError,
  configurationsLoading,
  configurationsError,
  onGameChange,
  onModeChange,
  onConfigurationChange,
}: {
  games: Game[];
  modes: GameMode[];
  configurations: ModeTeamConfiguration[];
  selectedGameId: string;
  selectedModeId: string;
  selectedConfigurationId: string;
  errors: TournamentErrors;
  gamesLoading: boolean;
  gamesError: boolean;
  modesLoading: boolean;
  modesError: boolean;
  configurationsLoading: boolean;
  configurationsError: boolean;
  onGameChange: (gameId: string) => void;
  onModeChange: (modeId: string) => void;
  onConfigurationChange: (configurationId: string) => void;
}) {
  const activeGames = games.filter((game) => game.status === "active");
  const activeModes = modes.filter((mode) => mode.active);
  const selectedModeConfigurations = configurations.filter((configuration) => configuration.mode_id === selectedModeId);

  return (
    <div className="grid gap-5">
      <div className="space-y-2">
        <RadioCardGroup
          id="game_id"
          name="game_id"
          label="Game"
          value={selectedGameId}
          error={errors.game_id}
          onChange={onGameChange}
          columns="grid-cols-1 sm:grid-cols-2"
          options={activeGames.map((game) => ({
            value: game.id,
            label: game.name,
            leading: game.icon_url
              ? <Image src={game.icon_url} alt="" width={36} height={36} className="size-full object-cover" />
              : <Gamepad2 className="size-4" />,
          }))}
        />
        {gamesLoading && <p role="status" className="text-xs text-muted-foreground">Loading available games…</p>}
        {gamesError && <p role="alert" className="text-sm text-destructive">Game choices are unavailable. Try again later.</p>}
        {!gamesLoading && !gamesError && activeGames.length === 0 && (
          <p role="status" className="text-sm text-muted-foreground">No active games are available yet.</p>
        )}
      </div>

      {!selectedGameId ? (
        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          Choose a game to see its available modes and team sizes.
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <RadioCardGroup
              id="mode_id"
              name="mode_id"
              label="Game mode"
              value={selectedModeId}
              onChange={onModeChange}
              columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              options={activeModes.map((mode) => ({ value: mode.id, label: mode.name }))}
            />
            {modesLoading && <p role="status" className="text-xs text-muted-foreground">Loading available modes…</p>}
            {modesError && <p role="alert" className="text-sm text-destructive">Mode choices are unavailable. Try again later.</p>}
            {!modesLoading && !modesError && activeModes.length === 0 && (
              <p role="status" className="text-sm text-muted-foreground">No active modes are available for this game.</p>
            )}
          </div>

          <div className="space-y-2">
            <RadioCardGroup
              id="mode_team_configuration_id"
              name="mode_team_configuration_id"
              label="Team configuration"
              value={selectedConfigurationId}
              error={errors.mode_team_configuration_id}
              onChange={onConfigurationChange}
              columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              options={selectedModeConfigurations.map((configuration) => ({
                value: configuration.id,
                label: configuration.name,
                detail: `${configuration.team_size} ${configuration.team_size === 1 ? "player" : "players"} per team`,
              }))}
            />
            {(modesLoading || configurationsLoading) && (
              <p role="status" className="text-xs text-muted-foreground">Loading modes and team configurations…</p>
            )}
            {(modesError || configurationsError) && (
              <p role="alert" className="text-sm text-destructive">Mode or team configuration choices are unavailable. Try again later.</p>
            )}
            {!selectedModeId && (
              <p className="text-sm text-muted-foreground">Choose a game mode to see its team configurations.</p>
            )}
            {!modesLoading && !configurationsLoading && !modesError && !configurationsError && selectedModeId && selectedModeConfigurations.length === 0 && (
              <p role="status" className="text-sm text-muted-foreground">This mode does not have a team configuration yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
