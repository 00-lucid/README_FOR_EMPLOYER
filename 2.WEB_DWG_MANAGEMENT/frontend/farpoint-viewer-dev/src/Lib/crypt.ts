import CryptoJS from 'crypto-js'

const secret = CryptoJS.enc.Utf8.parse('d4g7u2db7g0l2r1dhy3svgt871segu09')

const crypt = {
    encrypt: (source: string | undefined) => {
        if (!source) return undefined

        const opt = { iv: CryptoJS.enc.Utf8.parse(''), padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC }
        const encrypted = CryptoJS.AES.encrypt(source, secret, opt)
        const output = encrypted.toString()

        return encodeURIComponent(output)
    },

    decrypt: (source: string | undefined | null) => {
        if (!source) {
            return undefined
        }

        const opt = { iv: CryptoJS.enc.Utf8.parse(''), padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC }
        const decrypted = CryptoJS.AES.decrypt(source, secret, opt)
        const output = CryptoJS.enc.Utf8.stringify(decrypted)

        return output
    },
    CryptoJS,
}

export default crypt
