"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toChunk = toChunk;
function toChunk(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}
//# sourceMappingURL=toChank.js.map