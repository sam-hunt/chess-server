import { ShortMove, Square } from 'chess.js';
import { Promotion } from '../game/promotion.enum';
import { IsString, Matches, IsOptional } from 'class-validator';

export class MoveCommand implements ShortMove {
    @IsString() @Matches(/^[a-h][1-8]$/)
    public from: Square;

    @IsString() @Matches(/^[a-h][1-8]$/)
    public to: Square;

    @IsOptional() @IsString() @Matches(/^[nrbq]$/)
    public promotion?: Promotion;
}
