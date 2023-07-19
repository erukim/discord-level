// Type definitions for discord-xp v1.1.8
// Project: https://github.com/MrAugu/discord-xp
// Definitions by: Nico Finkernagel <https://github.com/gruselhaus/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

import { Client, Guild } from "discord.js";
import { ConnectOptions } from "mongoose";

export type User = {
  position: number;
  userID: string;
  guildID: string;
  xp: number;
  level: number;
  lastUpdated: Date;
  cleanXp: number;
  cleanNextLevelXp: number;
};

export type LeaderboardUser = {
  guildID: string;
  userID: string;
  xp: number;
  level: number;
  position: number;
  username: string | null;
  discriminator: string | null;
};

type Level_Type = 'Chat' | 'Voice'

export interface Level {
  userID: string;
  guildID: string;
  xp: number;
  level: number;
  lastUpdated: Date;
  type: Level_Type;
}

declare module "discord-level" {
  export default class Levels {
    static async setURL(dbURL: string, options: ConnectOptions): Promise<typeof import("mongoose")>;
    static async createUser(userId: string, guildId: string, types: Level_Type): Promise<User>;
    static async deleteUser(userId: string, guildId: string, types: Level_Type): Promise<User>;
    static async deleteGuild(guildId: string, types: Level_Type): Promise<Guild>;
    static async appendXp(userId: string, guildId: string, xp: number, types: Level_Type): Promise<boolean>;
    static async appendLevel(userId: string, guildId: string, levels: number, types: Level_Type): Promise<User>;
    static async setXp(userId: string, guildId: string, xp: number, types: Level_Type): Promise<User>;
    static async setLevel(userId: string, guildId: string, level: number, types: Level_Type): Promise<User>;
    static async fetch(userId: string, guildId: string, types: Level_Type, fetchPosition = false): Promise<User>;
    static async subtractXp(userId: string, guildId: string, xp: number, types: Level_Type): Promise<User>;
    static async subtractLevel(userId: string, guildId: string, level: number, types: Level_Type): Promise<User>;
    static async fetchLeaderboard(guildId: string, limit: number, types: Level_Type): Promise<User[] | []>;
    static async computeLeaderboard(client: Client, leaderboard: User[], fetchUsers = false): Promise<LeaderboardUser[] | []>;
    static xpFor(targetLevel: number): number;
  }
}
