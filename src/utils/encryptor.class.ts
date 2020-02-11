import { v4 as uuid } from 'uuid';
import { Utf8AsciiBinaryEncoding, HexBase64BinaryEncoding, createDecipheriv, createCipher, createDecipher, randomBytes, createCipheriv, createHash } from 'crypto';

export class Encryptor {
    protected algorithm = 'aes256';
    protected inputEncoding: Utf8AsciiBinaryEncoding = 'utf8';
    protected outputEncoding: HexBase64BinaryEncoding = 'hex';
    protected keyHash: string;

    constructor(protected readonly key: string = uuid()) {
        this.keyHash = createHash('sha256').update(String(key)).digest('base64').substr(0, 32);
    }

    public encrypt(text: string): string {
        // console.log('Ciphering "%s" with key "%s" using %s', text, this.keyHash, this.algorithm);
        const iv = randomBytes(16);
        const cipher = createCipheriv(this.algorithm, this.keyHash, iv);
        let ciphered = cipher.update(text, this.inputEncoding, this.outputEncoding);
        ciphered += cipher.final(this.outputEncoding);
        const ciphertext = iv.toString(this.outputEncoding) + ':' + ciphered
        // console.log('Result in %s is "%s"', this.outputEncoding, ciphertext);
        return ciphertext;
    }

    public decrypt(ciphertext: string): string {
        const components = ciphertext.split(':');
        const iv_from_ciphertext = Buffer.from(components.shift(), this.outputEncoding);
        const decipher = createDecipheriv(this.algorithm, this.keyHash, iv_from_ciphertext);
        let deciphered = decipher.update(components.join(':'), this.outputEncoding, this.inputEncoding);
        deciphered += decipher.final(this.inputEncoding);
        // console.log(deciphered);
        return deciphered;
    }
}
