"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const encode_1 = require("./encode");
describe('BoxClaimedArgs array encode/decode', () => {
    it('should encode and decode correctly', () => {
        const logs = [
            { user: '0x', position: 1, token: 5 },
            { user: '0x', position: 300, token: 255 },
        ];
        const encoded = (0, encode_1.encodeBoxClaimedEvents)(logs);
        expect(encoded.byteLength).toBe(logs.length * 3);
        const decoded = (0, encode_1.decodeBoxClaimedEvents)(encoded);
        expect(decoded).toEqual(logs);
    });
});
