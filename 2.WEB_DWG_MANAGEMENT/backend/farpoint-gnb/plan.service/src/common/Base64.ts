export class Base64 {
    public static encode(source: Buffer): string {
        return source.toString('base64')
    }

    public static decode(source: string): Buffer {
        return Buffer.from(source, 'base64')
    }

    public static encodeFromStr(source: string): string {
        return Buffer.from(source).toString('base64')
    }

    public static decodeToStr(source: string): string {
        return Buffer.from(source, 'base64').toString('utf8')
    }
}
