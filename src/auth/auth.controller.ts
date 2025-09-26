/* eslint-disable prettier/prettier */

import { UserService } from "src/users/user.service";
import { TokenService } from "./tokens.service";
import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import type { AuthenticatedRequest } from "src/common/interfaces/authenticated-request";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiTags("Autenticación")
@Controller("auth")
export class AuthController{
    constructor(private readonly tokenService: TokenService,
        private readonly userService: UserService
    ){}

    @Post("login")
    async login(@Body() dto:{email:string, password:string}){
        const usuario= await this.userService.login(dto.email, dto.password);
        if(!usuario)
            throw Error("Usuario no encontrado");
        const userProfile = {id: usuario.id.toString(), email: usuario.email, name: usuario.name};
        const accessToken = await this.tokenService.generateAccess(userProfile);
        const refreshToken= await this.tokenService.generateRefresh(usuario.id.toString());
        return { accessToken, refreshToken };
    }

    @Get("profile")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    getProfile(@Req() req: AuthenticatedRequest){
        return {profile: req.user.profile}
    }

    @Post("refresh")
    async refresh(@Body() dto: {refreshToken: string}){
        try{
            const payload= await this.tokenService.verifyRefresh(dto.refreshToken);
            const user= await this.userService.findById(Number(payload.sub));
            if(!user) throw Error("Usuario no encontrado");
            const newAccessToken = await this.tokenService.generateAccess({id: user.id.toString(), email: user.email, name: user.name});
            return {accessToken: newAccessToken};
        }catch{
            throw Error("Token de refresco inválido");
        }
    }

    @Post("logout")
    async logout(@Body() dto: {refreshToken: string}){
        await this.tokenService.revokeRefresh(dto.refreshToken);
        return { success: true };
    }

    @Post("logout-all")
    async logoutAll(@Body() dto: {userId: number}){
        await this.tokenService.revokeAllForUser(dto.userId);
        return { success: true };
    }

}
