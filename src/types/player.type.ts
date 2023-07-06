export type Player = {
  id: string
  name: string,
  games_played: number | 0
  games_won: number | 0,
  created_at: Date | undefined,
  deleted: boolean | false
}
