import { ServerReadableStream, sendUnaryData } from 'grpc';
import { Data } from '../types/ImageService_pb';
import { Empty } from '../types/Empty_pb';
import { DiskService } from '../services/DiskService';
import { ImageService } from '../services/ImageService';
import { READABLE_STREAM_EVENT } from '../utils/enums';

interface IImageController {
    uploadImage(call: ServerReadableStream<Data>, callback: sendUnaryData<Empty>): Promise<any>;
}

export class ImageController implements IImageController {
    async uploadImage(call: ServerReadableStream<Data>, callback: sendUnaryData<Empty>): Promise<any> {
        const res = new Empty();
        const chunks: Uint8Array[] = [];

        call.on(READABLE_STREAM_EVENT.DATA, (chunk: Data) => {
            chunks.push(chunk.getBinary_asU8());
        });
        call.on(READABLE_STREAM_EVENT.END, async () => {
            const desiredSize = { width: 250, height: 250 }; // consider getting these values in request
            const imageBuff = Buffer.concat(chunks);
            const resized = await ImageService.resize(imageBuff, desiredSize.width, desiredSize.height);
            // you may want to replace this with a S3 pipe etc.
            await DiskService.write(resized, `./assets/image_raw_${desiredSize.width}x${desiredSize.height}.png`);
            callback(null, res);
        });
        call.on(READABLE_STREAM_EVENT.ERROR, (err: Error) => {
            console.error(err);
            callback(err, res);
        });
    }
}
