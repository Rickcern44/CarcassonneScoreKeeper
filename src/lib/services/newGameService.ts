import type { Player } from '../../types/player.type';
import type { GameColor } from "../../types/enums/gamecolor.enum";

export const removePlayerFromGame = (id: string, availablePlayerList: Array<Player>, currentPlayerList: Array<Player>) => {
	const selectedPlayer: Player | undefined = availablePlayerList.find((x) => x.id === id);
	currentPlayerList = currentPlayerList.filter((x) => x?.id !== id);

	if (selectedPlayer === undefined) {
		return {
			available: availablePlayerList,
			current: currentPlayerList,
			success: { state: false, message: 'Player not found' }
		};
	}

	availablePlayerList = [...availablePlayerList, selectedPlayer];
	currentPlayerList = [...currentPlayerList];

	return {
		available: availablePlayerList,
		current: currentPlayerList,
		success: { state: true, message: 'Player Removed from Game!' }
	};
};

export const addPlayerToGame = (playerId: string, playerColor: GameColor, availablePlayerList: Array<Player>, currentPlayerList: Array<Player>) => {
	const selectedPlayer: Player | undefined = availablePlayerList.find((x) => x.id === playerId);

	if (selectedPlayer === undefined) {
		return {
			available: availablePlayerList,
			current: currentPlayerList,
			success: { state: false, message: 'Player not found' }
		};
	}

	selectedPlayer.color = playerColor;

	currentPlayerList = [...currentPlayerList, selectedPlayer];

	availablePlayerList = availablePlayerList.filter((x) => x.id !== selectedPlayer.id);
	availablePlayerList = [...availablePlayerList];

	return {
		available: availablePlayerList,
		current: currentPlayerList,
		success: { state: true, message: 'Player Added to Game!' }
	};
};
