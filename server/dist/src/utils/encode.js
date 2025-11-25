"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeBoxClaimedEvents = encodeBoxClaimedEvents;
exports.decodeBoxClaimedEvents = decodeBoxClaimedEvents;
function encodeBoxClaimedEvents(logs) {
    const entrySize = 3;
    const buffer = new ArrayBuffer(entrySize * logs.length);
    const view = new DataView(buffer);
    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        const offset = i * entrySize;
        view.setUint16(offset, log.position); // 2bytes
        view.setUint8(offset + 2, log.token); // 1byte
    }
    return buffer;
}
function decodeBoxClaimedEvents(buffer) {
    const entrySize = 3;
    const view = new DataView(buffer);
    const logs = [];
    const len = buffer.byteLength / entrySize;
    for (let i = 0; i < len; i++) {
        const offset = i * entrySize;
        const position = view.getUint16(offset);
        const token = view.getUint8(offset + 2);
        logs.push({ user: '0x', position, token }); // user is unknown here
    }
    return logs;
}
