import { Controller, Get } from '@nestjs/common';
import { GameManager } from './game-manager/game-manager.class';
import { Game } from './game/game.class';

@Controller('/lobby')
export class LobbyController {
    constructor(private readonly gameManager: GameManager) { }

    @Get('/')
    public async lobby(): Promise<Partial<Game>[]> {
        return this.gameManager.find()
            .then(games => games.map(game => ({ id: game.id, name: game.name, player: game.players })))
    }
}
