import { beforeEach, describe, expect } from "vitest";
import { addPlayerToGame, removePlayerFromGame } from "../../lib/services/newGameService";
import type { Player } from "../../types/player.type";
import { GameColor } from "../../types/enums/gamecolor.enum";

interface PlayerListContext {
  availPlayers: Array<Player>
  currentPlayers: Array<Player>
}

const availPlayers: Array<Player> = [
  {id: '1', name: 'test1', color: undefined}
]
const currentPlayers: Array<Player> = [
  {id: '2', name: 'test2', color: undefined },
]

beforeEach<PlayerListContext>(async (context) => {
  context.availPlayers = availPlayers
  context.currentPlayers = currentPlayers
})


describe('game service tests', () => {
  it<PlayerListContext>('remove player from game', (context) => {

    const {current, available, success} = removePlayerFromGame("2", context.availPlayers, context.currentPlayers)

    expect(available.length).toBe(2);
    expect(current.length).toBe(0);
    expect(success.state).toBe(true);
  })
  it<PlayerListContext>('add player to game', (context) => {
    const playerId = '1'
    const playerColor = GameColor.red

    const {current, available, success} = addPlayerToGame(playerId, playerColor, context.availPlayers, context.currentPlayers)

    expect(available.length).toBe(0);
    expect(current.length).toBe(2);
    expect(current[1].color).toBe(GameColor.red)
    expect(success.state).toBe(true);
  })
  it<PlayerListContext>('incorrect player id throw error on add', (context) => {
    const playerId = '10'
    const playerColor = GameColor.red

    const {current, available, success} = addPlayerToGame(playerId, playerColor, context.availPlayers, context.currentPlayers)

    expect(available.length).toBe(1);
    expect(current.length).toBe(1);
    expect(success.state).toBe(false)
    expect(success.message).toBe('Player not found')
  })
})
