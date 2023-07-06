import type { Player } from "../../types/player.type";


export const removePlayerFromGame = (id: string, availablePlayerList: Array<Player | undefined> ,currentPlayerList: Array<Player | undefined>) => {
    const selectedPlayer: Player | undefined = availablePlayerList.find(x => x?.id === id)
    availablePlayerList = availablePlayerList.filter(x => x?.id !== id)

    // Add Player to current players
    currentPlayerList = [...currentPlayerList, selectedPlayer]
    // Remove players from available players
    availablePlayerList = [...availablePlayerList]

    return {avail: availablePlayerList, curr: currentPlayerList, success: true}
  }

// export const addPlayerToCurrentGame = (playerId: string, colorId: string, availablePlayerList: Array<Player | undefined> ,currentPlayerList: Array<Player | undefined>) => {
//     const selectedPlayer = availablePlayerList.find(x => x?.id === playerId)
//     const selectedColor = availableColors.find(x => x.id === colorId)
//     const colorToAdd : PlayerColor = {colorId: selectedColor.colorId, playerId: selectedPlayer?.id, name: selectedColor.name}
//
//     if (currentPlayerList.length === 6){
//         return {success: false, error: 'Too many Players'}
//     }
//     else{
//         availablePlayers = availablePlayers.filter(x => x.id != playerId)
//
//         // Add Player to current players and selected Colors
//         currentPlayers = [...currentPlayers, selectedPlayer]
//         selectedColors = [...selectedColors, colorToAdd]
//         // Remove players from available players
//         availablePlayers = [...availablePlayers]
//         availableColors = [...availableColors]
//
//         playerId = "0";
//         colorId = "0";
//     }
// }
