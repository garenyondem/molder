import sharp = require('sharp');

export class ImageService {
    static resize(image: Buffer, width: number, height: number): Promise<Buffer> {
        return sharp(image)
            .resize(width, height)
            .sharpen()
            .png({ quality: 80 })
            .toBuffer();
    }
}
