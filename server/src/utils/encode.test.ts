import { BoxClaimedArgs, decodeBoxClaimedEvents, encodeBoxClaimedEvents } from "./encode"

describe('BoxClaimedArgs array encode/decode', () => {
  it('should encode and decode correctly', () => {
    const logs: BoxClaimedArgs[] = [
      { user: '0x', position: 1, token: 5 },
      { user: '0x', position: 300, token: 255 },
    ]
    const encoded = encodeBoxClaimedEvents(logs)
    expect(encoded.byteLength).toBe(logs.length * 3)

    const decoded = decodeBoxClaimedEvents(encoded)
    expect(decoded).toEqual(logs)
  })
})
