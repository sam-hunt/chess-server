export interface IGameState {
    fen: string,
    isCheck: boolean,
    isCheckMate: boolean,
    isDraw: boolean,
    isStalemate: boolean,
    is3foldRep: boolean,
}
