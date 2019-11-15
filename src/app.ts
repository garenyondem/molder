import { Server, ServerCredentials, ServerReadableStream, sendUnaryData } from 'grpc';
import sharp from 'sharp';
import fs from 'fs';
import { promisify } from 'util';
import { ImageServiceService } from './types/ImageService_grpc_pb';
import { Data } from './types/ImageService_pb';
import { Empty } from './types/Empty_pb';
const writeFile = promisify(fs.writeFile);

class ImageController {
    async uploadImage(call: ServerReadableStream<Data>, callback: sendUnaryData<Empty>): Promise<any> {
        const res = new Empty();
        const chunks: Uint8Array[] = [];

        call.on(READABLE_STREAM_EVENT.DATA, (chunk: Data) => {
            chunks.push(chunk.getBinary_asU8());
        });
        call.on(READABLE_STREAM_EVENT.END, async () => {
            const desiredSize = { width: 250, height: 250 }; // consider getting these values in request
            const imageBuff = Buffer.concat(chunks);
            const resized = await resizeImage(imageBuff, desiredSize.width, desiredSize.height);
            // you may want to replace this with a S3 pipe etc.
            await saveToDisk(resized, `./assets/image_raw_${desiredSize.width}x${desiredSize.height}.png`);
            callback(null, res);
        });
        call.on(READABLE_STREAM_EVENT.ERROR, (err: Error) => {
            console.error(err);
            callback(err, res);
        });
    }
}

enum READABLE_STREAM_EVENT {
    CLOSE = 'close',
    DATA = 'data',
    END = 'end',
    ERROR = 'error',
    READABLE = 'readable',
}

function resizeImage(image: Buffer, width: number, height: number): Promise<Buffer> {
    return sharp(image)
        .resize(width, height)
        .sharpen()
        .png({ quality: 80 })
        .toBuffer();
}

function saveToDisk(image: Buffer, path: string): Promise<void> {
    return writeFile(path, image);
}

export function main() {
    const HOST = '0.0.0.0';
    const PORT = process.env.PORT ?? 50055;
    const server = new Server();
    server.addService(ImageServiceService, new ImageController());
    server.bind(`${HOST}:${PORT}`, ServerCredentials.createInsecure());
    server.start();
    console.info(`Listening on ${HOST}:${PORT}`);
}

process
    .on('uncaughtException', shutdown)
    .on('SIGINT', shutdown)
    .on('SIGTERM', shutdown);

function shutdown(err: any) {
    err && console.error(err);
    process.exit();
}
