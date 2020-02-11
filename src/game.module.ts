import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { LobbyController } from './lobby.controller';
import { GameGateway } from './game.gateway';
import { GameManager } from './game-manager/game-manager.class';
import { LobbyGateway } from './lobby.gateway';

const GAME_MANAGER_TOKEN = 'GAME_MANAGER';

@Module({
    imports: [],
    controllers: [GameController, LobbyController],
    providers: [
        {
            provide: GAME_MANAGER_TOKEN,
            useValue: new GameManager(),
        },
        {
            provide: GameManager,
            useExisting: GAME_MANAGER_TOKEN,
        },
        GameGateway,
        LobbyGateway,
    ],
})
export class GameModule {}
