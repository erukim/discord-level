const mongoose = require("mongoose");
const levels = require("./models/levels.js");

class DiscordXp {
  mongoUrl;
  
  /**
   * MongoDB에 연결하기 위한 URI를 설정합니다.
   * @param {string} [dbUrl] - A valid mongo database URI.
   */
  static async setURL(dbUrl, options) {
    if (!dbUrl) throw new TypeError("A database url was not provided.");
    if (!options) throw new TypeError("A database options was not provided.");
    this.mongoUrl = dbUrl;
    return mongoose.connect(dbUrl, options);
  }

  /**
  * @param {string} [userId] - Discord user id.
  * @param {string} [guildId] - Discord guild id.
  * @param {import("./index.d.ts").Level_Type} types
  */
  static async createUser(userId, guildId, types) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");

    const isUser = await levels.findOne({ userID: userId, guildID: guildId, type: types });
    if (isUser) return false;

    const newUser = new levels({ userID: userId, guildID: guildId, type: types });

    await newUser.save().catch(e => console.log(`Failed to create user: ${e}`));

    return newUser;
  }

  /**
  * @param {string} [userId] - Discord user id.
  * @param {string} [guildId] - Discord guild id.
  * @param {import("./typings/index.js").Level_Type} types
  */
  static async deleteUser(userId, guildId, types) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");

    const user = await levels.findOne({ userID: userId, guildID: guildId, type: types });
    if (!user) return false;

    await levels.findOneAndDelete({ userID: userId, guildID: guildId, type: types }).catch(e => console.log(`Failed to delete user: ${e}`));

    return user;
  }

  /**
  * @param {string} [userId] - Discord user id.
  * @param {string} [guildId] - Discord guild id.
  * @param {number} [xp] - Amount of xp to append.
  * @param {import("./typings/index.js").Level_Type} types
  */
  static async appendXp(userId, guildId, xp, types) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (xp == 0 || !xp || isNaN(parseInt(xp))) throw new TypeError("An amount of xp was not provided/was invalid.");

    const user = await levels.findOne({ userID: userId, guildID: guildId, type: types });

    if (!user) {
      const newUser = new levels({ userID: userId, guildID: guildId, xp: xp, level: Math.floor(0.1 * Math.sqrt(xp)), type: types });

      await newUser.save().catch(e => console.log(`Failed to save new user.`));

      return (Math.floor(0.1 * Math.sqrt(xp)) > 0);
    };

    user.xp += parseInt(xp, 10);
    user.level = Math.floor(0.1 * Math.sqrt(user.xp));
    user.lastUpdated = new Date();

    await user.save().catch(e => console.log(`Failed to append xp: ${e}`));

    return (Math.floor(0.1 * Math.sqrt(user.xp -= xp)) < user.level);
  }

  /**
  * @param {string} [userId] - Discord user id.
  * @param {string} [guildId] - Discord guild id.
  * @param {number} [levels] - Amount of levels to append.
  * @param {import("./typings/index.js").Level_Type} types
  */
  static async appendLevel(userId, guildId, levelss, types) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (!levelss) throw new TypeError("An amount of levels was not provided.");

    const user = await levels.findOne({ userID: userId, guildID: guildId, type: types });
    if (!user) return false;

    user.level += parseInt(levelss, 10);
    user.xp = user.level * user.level * 100;
    user.lastUpdated = new Date();

    user.save().catch(e => console.log(`Failed to append level: ${e}`));

    return user;
  }

  /**
  * @param {string} [userId] - Discord user id.
  * @param {string} [guildId] - Discord guild id.
  * @param {number} [xp] - Amount of xp to set.
  * @param {import("./typings/index.js").Level_Type} types
  */
  static async setXp(userId, guildId, xp, types) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (xp == 0 || !xp || isNaN(parseInt(xp))) throw new TypeError("An amount of xp was not provided/was invalid.");

    const user = await levels.findOne({ userID: userId, guildID: guildId, type: types });
    if (!user) return false;

    user.xp = xp;
    user.level = Math.floor(0.1 * Math.sqrt(user.xp));
    user.lastUpdated = new Date();

    user.save().catch(e => console.log(`Failed to set xp: ${e}`));

    return user;
  }

  /**
  * @param {string} [userId] - Discord user id.
  * @param {string} [guildId] - Discord guild id.
  * @param {number} [level] - A level to set.
  * @param {import("./typings/index.js").Level_Type} types
  */
  static async setLevel(userId, guildId, level, types) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (!level) throw new TypeError("A level was not provided.");

    const user = await levels.findOne({ userID: userId, guildID: guildId, type: types });
    if (!user) return false;

    user.level = level;
    user.xp = level * level * 100;
    user.lastUpdated = new Date();

    user.save().catch(e => console.log(`Failed to set level: ${e}`));

    return user;
  }

  /**
  * @param {string} [userId] - Discord user id.
  * @param {string} [guildId] - Discord guild id.
  * @param {import("./typings/index.js").Level_Type} types
  */
  static async fetch(userId, guildId, types, fetchPosition = false) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");

    const user = await levels.findOne({ userID: userId, guildID: guildId, type: types });
    if (!user) return false;

    if (fetchPosition === true) {
      const leaderboard = await levels.find({ guildID: guildId, type: types }).sort([['xp', 'descending']]).exec();

      user.position = leaderboard.findIndex(i => i.userID === userId) + 1;
    }


    /* To be used with canvacord or displaying xp in a pretier fashion, with each level the cleanXp stats from 0 and goes until cleanNextLevelXp when user levels up and gets back to 0 then the cleanNextLevelXp is re-calculated */
    user.cleanXp = user.xp - this.xpFor(user.level);
    user.cleanNextLevelXp = this.xpFor(user.level + 1) - this.xpFor(user.level);

    return user;
  }

  /**
  * @param {string} [userId] - Discord user id.
  * @param {string} [guildId] - Discord guild id.
  * @param {number} [xp] - Amount of xp to subtract.
  * @param {import("./typings/index.js").Level_Type} types
  */
  static async subtractXp(userId, guildId, xp, types) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (xp == 0 || !xp || isNaN(parseInt(xp))) throw new TypeError("An amount of xp was not provided/was invalid.");

    const user = await levels.findOne({ userID: userId, guildID: guildId, type: types });
    if (!user) return false;

    user.xp -= xp;
    user.level = Math.floor(0.1 * Math.sqrt(user.xp));
    user.lastUpdated = new Date();

    user.save().catch(e => console.log(`Failed to subtract xp: ${e}`));

    return user;
  }

  /**
  * @param {string} [userId] - Discord user id.
  * @param {string} [guildId] - Discord guild id.
  * @param {number} [levels] - Amount of levels to subtract.
  * @param {import("./typings/index.js").Level_Type} types
  */
  static async subtractLevel(userId, guildId, levelss, types) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (!levelss) throw new TypeError("An amount of levels was not provided.");

    const user = await levels.findOne({ userID: userId, guildID: guildId, type: types });
    if (!user) return false;

    user.level -= levelss;
    user.xp = user.level * user.level * 100;
    user.lastUpdated = new Date();

    user.save().catch(e => console.log(`Failed to subtract levels: ${e}`));

    return user;
  }

  /**
  * @param {string} [guildId] - Discord guild id.
  * @param {number} [limit] - Amount of maximum enteries to return.
  * @param {import("./typings/index.js").Level_Type} types
  */
  static async fetchLeaderboard(guildId, limit, types) {
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (!limit) throw new TypeError("A limit was not provided.");

    const users = await levels.find({ guildID: guildId, type: types }).sort([['xp', 'descending']]).exec();

    return users.slice(0, limit);
  }
  
  /**
   * @param {string} [guildId] - Discord guild id.
   * @param {import("./index.d.ts").Level_Type} types
   * @param {number} [limit] - Amount of maximum entries to return.
   * @param {number} [page] - Page starts from 1
   */
  static async nativeFetchLeaderboard(guildId, types, limit, page = 1) {
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (!limit) throw new TypeError("A limit was not provided.");
    
    const users = await levels.find({ guildID: guildId, type: types }).sort([['xp', 'descending']]).skip((page - 1) * limit).limit(limit).exec();
    
    return users;
  }

  /**
  * @param {string} [client] - Your Discord.CLient.
  * @param {array} [leaderboard] - The output from 'fetchLeaderboard' function.
  */
  static async computeLeaderboard(client, leaderboard, fetchUsers = false) {
    if (!client) throw new TypeError("A client was not provided.");
    if (!leaderboard) throw new TypeError("A leaderboard id was not provided.");

    if (leaderboard.length < 1) return [];

    const computedArray = [];

    for (const key of leaderboard) {
      const cachedUser = client.users.cache.get(key.userID);
      const user = fetchUsers 
        ? (await client.users.fetch(key.userId) || { username: "Unknown", discriminator: "0000" })
        : {
          username: cachedUser ? cachedUser.username : "Unknown",
          discriminator: cachedUser ? cachedUser.discriminator : "0000"
        }
      
      computedArray.push({
        guildId: key.guildID,
        userId: key.userID,
        xp: key.xp,
        level: key.level,
        position: (leaderboard.findIndex(i => i.guildID === key.guildID && i.userID === key.userID) + 1),
        username: user.username,
        discriminator: user.discriminator,
      });
    }

    return computedArray;
  }
  
  /**
   * @param {number} [page] - Page starts from 1
   * @param {array} [computedLeaderboard] - output from `computeLeaderboard` function.
   */
  static async paginateLeaderboard(page, computedLeaderboard) {
    if (!computedLeaderboard) throw new TypeError("A leaderboard was not provided.");
    
    return computedLeaderboard.map((entry) => ({ ...entry, position: entry.position + ((page - 1) * computedLeaderboard.length) }))
  }

  /*
  * @param {number} [targetLevel] - Xp required to reach that level.
  */
  static xpFor(targetLevel) {
    if (isNaN(targetLevel) || isNaN(parseInt(targetLevel, 10))) throw new TypeError("Target level should be a valid number.");
    if (isNaN(targetLevel)) targetLevel = parseInt(targetLevel, 10);
    if (targetLevel < 0) throw new RangeError("Target level should be a positive number.");
    return targetLevel * targetLevel * 100;
  }

  /**
  * @param {string} [guildId] - Discord guild id.
  */
  static async deleteGuild(guildId) {
    if (!guildId) throw new TypeError("A guild id was not provided.");

    const guild = await levels.findOne({ guildID: guildId });
    if (!guild) return false;

    await levels.deleteMany({ guildID: guildId }).catch(e => console.log(`Failed to delete guild: ${e}`));

    return guild;
  }

  /**
   * 레벨 DB를 초기화하고 모든 데이터를 삭제합니다.
   */
  static async ResetLevel() {
    await levels.deleteMany().catch(e => console.log(`Failed to delete guild: ${e}`));
    return true
  }
}

module.exports = DiscordXp;
