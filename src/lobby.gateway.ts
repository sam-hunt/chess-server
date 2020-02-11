import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { GameManager } from './game-manager/game-manager.class';
import { GAME_HOSTED_EVENT } from './game-manager/game-events';
import { classToPlain } from 'class-transformer';

@WebSocketGateway({ namespace: 'lobby' })
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() protected server: Server;
    
    protected sockets: Set<Socket> = new Set();
    
    public constructor(
        protected readonly gameManager: GameManager,
    ) {
        this.gameManager.on(GAME_HOSTED_EVENT, event => this.broadcast(GAME_HOSTED_EVENT, classToPlain(event)))
        console.log(this.server);
    }
    
    handleConnection(socket: Socket): void {
        this.sockets.add(socket);
    }
    
    handleDisconnect(socket: Socket) {
        this.sockets.delete(socket);
    }
    
    protected broadcast = (event: string, message: object) => {
        Array.from(this.sockets.values()).forEach(socket => socket.send(event, JSON.stringify(message)));
    }
}
