"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDuplicate = isDuplicate;
const Redis_1 = require("../lib/Redis");
const config_1 = require("../config");
async function isDuplicate(id) {
    const key = `dedup:${id}`;
    const result = await Redis_1.redis.set(key, '1', {
        NX: true,
        EX: config_1.redisConfig.deduplicationTtlSec
    });
    return result === null;
}
//# sourceMappingURL=deduplication.js.map