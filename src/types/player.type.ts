import type { GameColor } from "./enums/gamecolor.enum";

export type Player = {
  id: string
  name: string,
  color: GameColor | undefined
}
