import { IsOptional, IsString, MinLength } from "class-validator";

export class JoinCommand {
    @IsString() @MinLength(1)
    public playerName: string;
}
