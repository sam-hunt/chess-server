import { IsOptional, IsString, MinLength } from "class-validator";

export class HostCommand {
    @IsString() @MinLength(1)
    public playerName: string;

    @IsOptional() @IsString()
    public initialStateFen: string;
}
