import { Controller, Get, Param, Post, Body, Res, Req, ValidationPipe, ParseIntPipe, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { GameManager } from './game-manager/game-manager.class';
import { Game } from './game/game.class';
import { Response, Request } from 'express';
import { Encryptor } from './utils/encryptor.class';
import { HostCommand, JoinCommand, MoveCommand } from './commands';
import { classToPlain } from 'class-transformer';

@Controller('/games')
export class GameController {
    protected readonly salt = uuid();
    protected readonly encryptor = new Encryptor();

    constructor(private readonly gameManager: GameManager) { }

    @Get('/:id')
    public async one(@Param('id', ParseIntPipe) id: number): Promise<Game> {
        return this.gameManager.one(id).then(classToPlain as any);
    }

    @Get('/:id/ascii')
    public async ascii(@Param('id', ParseIntPipe) id: number): Promise<string> {
        return this.gameManager.one(id).then(game => game.ascii);
    }

    @Post('/host')
    public async host(
        @Res() response: Response,
        @Body(new ValidationPipe({ transform: true })) hostCommand: HostCommand,
    ): Promise<Response> {
        const game = await this.gameManager.host(hostCommand.playerName, hostCommand.initialStateFen);
        const token = this.encryptor.encrypt((game.players.length - 1).toString());
        response.setHeader('Authorization', `Bearer ${token}`);
        return response.send(classToPlain(game));
    }

    @Post('/:id/join')
    public async join(
        @Res() response: Response,
        @Param('id', ParseIntPipe) id: Game['id'],
        @Body(new ValidationPipe({ transform: true })) joinCommand: JoinCommand,
    ): Promise<Response> {
        const game = await this.gameManager.join(id, joinCommand.playerName);
        const token = this.encryptor.encrypt((game.players.length - 1).toString());
        response.setHeader('Authorization', `Bearer ${token}`);
        return response.send(classToPlain(game));
    }

    @Post('/:id/move')
    public async move(
        @Req() request: Request,
        @Res() response: Response,
        @Param('id', ParseIntPipe) id: Game['id'],
        @Body(new ValidationPipe({ transform: true })) move: MoveCommand,
    ): Promise<Response> {
        const auth = request?.header('Authorization')?.slice(7);
        if (!auth) { throw new UnauthorizedException('Missing bearer token, please join the game first'); }
        const decodedAuth = this.encryptor.decrypt(auth);
        if (!decodedAuth || isNaN(decodedAuth as any)) { throw new UnauthorizedException('Invalid bearer token, please join the game first') }
        const seatId = parseInt(decodedAuth, 10);
        let game: Game = await this.gameManager.move(id, seatId, move).catch(e => {
            console.error(e);
            throw new BadRequestException('Unacceptable move', e);
        })
        return response.send(classToPlain(game));
    }
}
