/* eslint-disable prettier/prettier */

import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export type User= {
    id: number;
    email: string;
    name: string;
    password_hash: string;
    salt: string;
}


@Injectable()
export class UserRepository{
    constructor(private readonly dbService: DbService) {}

    async registerUser(email:string,
        name:string, password:string):Promise<User|void>{
        const sql= "INSERT INTO users (email,name,password_hash,salt, created_at, updated_at) VALUES (?,?,?, 'saltTest', NOW(), NOW())";
        await this.dbService.getPool().execute<ResultSetHeader>(sql,[email,name,password]);
    }

    async findByEmail(email:string):Promise<User>{
        const sql= "SELECT * FROM users WHERE email=? LIMIT 1";
        const [rows]= await this.dbService.getPool().execute<RowDataPacket[]>(sql,[email]);
        const result= rows as User[];
        return result[0];
    }
    async findById(id:number):Promise<User>{
        const sql= "SELECT * FROM users WHERE id=? LIMIT 1";
        const [rows]= await this.dbService.getPool().execute<RowDataPacket[]>(sql,[id]);
        const result= rows as User[];
        return result[0];
    }

    async updatePassword(id:number, passwordHash:string):Promise<void>{
        const sql = "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?";
        await this.dbService.getPool().execute<ResultSetHeader>(sql, [passwordHash, id]);
    }
}


