import * as moment from 'moment';
import { ChessInstance, Chess, Move as MoveResult } from "chess.js";
import { MoveCommand } from '../commands/move.command';
import { GameSeat } from "./game-seat.type";
import { IGameState } from "./game-state.interface";
import { Exclude } from 'class-transformer';

/** incrementing id counter for games */
let gameIdSeq: number = 1;

export class Game {
    public id?: number;
    public players: string[] = [];
    public lastMove: string;

    @Exclude()
    protected chessInstance: ChessInstance;

    public constructor(player1: string, initialStateFen?: string) {
        this.players.push(player1);
        this.id = gameIdSeq++;
        this.chessInstance = new Chess(initialStateFen);
    }

    public name = (): string => {
        return `${this.players[0]}'s game`;
    }

    public state = (): IGameState => {
        return {
            fen: this.chessInstance.fen(),
            isCheck: this.chessInstance.in_check(),
            isCheckMate: this.chessInstance.in_checkmate(),
            isDraw: this.chessInstance.in_draw(),
            isStalemate: this.chessInstance.in_stalemate(),
            is3foldRep: this.chessInstance.in_threefold_repetition(),
        }
    }

    public get ascii(): string {
        return this.chessInstance.ascii();
    }

    public join(player: string): GameSeat {
        return this.players.push(player) - 1;
    }

    public move(gameSeat: GameSeat, moveCommand: MoveCommand): MoveResult {
        const isLegalColorForSeat = this.chessInstance.get(moveCommand.from).color === (gameSeat === 0 ? 'w' : (gameSeat === 1 ? 'b' : null));
        const move = (isLegalColorForSeat) ? this.chessInstance.move(moveCommand) : null;
        if (move) { this.lastMove = moment().toISOString(); }
        return move;
    }

    public vacate(gameSeat: GameSeat) {

    }
}
