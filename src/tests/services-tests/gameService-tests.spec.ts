import { describe, expect } from "vitest";
import { removePlayerFromGame } from "../../lib/services/newGameService";
import type { Player } from "../../types/player.type";

describe('game service tests', () => {
  it('remove player from game', () => {
    let availPlayers: Array<Player | undefined> = [
      {id: '1', name: 'test1', deleted: false, created_at: new Date(), games_won: 0, games_played: 0 },
      {id: '2', name: 'test2', deleted: false, created_at: new Date(), games_won: 0, games_played: 0 },
    ]
    let currentPlayers: Array<Player | undefined> = []

    const {curr, avail, success} = removePlayerFromGame("1", availPlayers, currentPlayers)

    availPlayers = avail;
    currentPlayers = curr;

    expect(availPlayers.length).toBe(1);
    expect(currentPlayers.length).toBe(1);
    expect(success).toBe(true);
  })
})
