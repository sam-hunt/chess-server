import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { classToPlain } from 'class-transformer';
import { GameManager } from './game-manager/game-manager.class';
import { Game } from './game/game.class';
import { GAME_STATE_CHANGED_EVENT } from './game-manager/game-events';

@WebSocketGateway({ namespace: 'game' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    
    protected sockets: Map<Socket, Set<Game['id']>> = new Map();
    protected observers: Map<Game['id'], Set<Socket>> = new Map();
    
    public constructor(
        protected readonly gameManager: GameManager,
    ) {
        this.gameManager.on(GAME_STATE_CHANGED_EVENT, this.broadcastGameState);
    }
    
    handleConnection(socket: Socket): void {
        this.sockets.set(socket, new Set());
    }
    
    handleDisconnect(socket: Socket) {
        Array.from(this.sockets.get(socket)).forEach(gameId => this.observers.get(gameId).delete(socket));
        this.sockets.delete(socket);
    }

    @SubscribeMessage('watchGame')
    public async handleWatchGameCommand(@MessageBody() gameId: Game['id'], @ConnectedSocket() socket: Socket): Promise<Game> {
        const game = await this.gameManager.one(gameId);
        if (!game) return undefined;
        if (!this.observers.get(gameId)) this.observers.set(gameId, new Set());
        this.sockets.get(socket).add(gameId);
        this.observers.get(gameId).add(socket);
        return classToPlain(game) as Game;
    }

    @SubscribeMessage('unwatchGame')
    public async handleUnwatchGameCommand(@MessageBody() gameId: Game['id'], @ConnectedSocket() socket: Socket): Promise<void> {
        const game = await this.gameManager.one(gameId);
        if (!game) return undefined;
        this.sockets.get(socket).delete(gameId);
        this.observers.get(gameId).delete(socket);
        return undefined;
    }

    protected broadcastGameState = (game: Game) => {
        const plainGame = classToPlain(game) as Game;
        Array.from(this.observers.get(game.id) || []).forEach(socket => socket.send(GAME_STATE_CHANGED_EVENT, plainGame));
        const state = game.state();
        const gameEnd = state.isCheckMate || state.isDraw || state.isStalemate;
        if (gameEnd) {
            Array.from(this.observers.get(game.id)).forEach(socket => this.sockets.get(socket).delete(game.id));
            this.observers.delete(game.id);
        }
    }
}
    