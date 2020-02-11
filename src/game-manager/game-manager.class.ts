import { EventEmitter } from 'events';
import { Game } from '../game/game.class';
import { MoveCommand } from '../commands/move.command';
import { GameSeat } from '../game/game-seat.type';
import { GAME_STATE_CHANGED_EVENT, GAME_HOSTED_EVENT } from './game-events';

export class GameManager extends EventEmitter {
    protected games: Map<Game['id'], Game> = new Map();

    public one = async (id: Game['id']): Promise<Game> =>
        this.games.get(id);

    public find = async (): Promise<Game[]> =>
        Array.from(this.games.keys()).map(this.games.get);

    public host = async (playerName: string, initialStateFen?: string): Promise<Game> => {
        const game = new Game(playerName, initialStateFen);
        this.games.set(game.id, game);
        this.emit(GAME_HOSTED_EVENT, game)
        return game;
    }
    
    public join = async (gameId: Game['id'], playerName: string): Promise<Game> => {
        const game = this.games.get(gameId);
        game.join(playerName);
        this.emit(GAME_STATE_CHANGED_EVENT, game);
        return game;
    }

    public move = async (gameId: Game['id'], seatId: GameSeat, move: MoveCommand): Promise<Game> => {
        const game = this.games.get(gameId);
        const moveSuccess = game.move(seatId, move);
        if (!moveSuccess) {
            throw new Error('Invalid Move')
        }
        this.emit(GAME_STATE_CHANGED_EVENT, game);
        return game;
    }

    public delete = async (gameId): Promise<void> => {
        this.games.delete(gameId);
    }
}
