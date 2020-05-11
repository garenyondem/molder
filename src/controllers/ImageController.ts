import { ServerReadableStream, sendUnaryData } from 'grpc';
import { UploadImageRequest, UploadImageResponse } from '../types/ImageService_pb';
import { DiskService } from '../services/DiskService';
import { ImageService } from '../services/ImageService';
import { READABLE_STREAM_EVENT } from '../utils/enums';

interface IImageController {
    uploadImage(
        call: ServerReadableStream<UploadImageRequest>,
        callback: sendUnaryData<UploadImageResponse>
    ): Promise<any>;
}

export class ImageController implements IImageController {
    async uploadImage(
        call: ServerReadableStream<UploadImageRequest>,
        callback: sendUnaryData<UploadImageResponse>
    ): Promise<any> {
        const res = new UploadImageResponse();
        const chunks: Uint8Array[] = [];

        call.on(READABLE_STREAM_EVENT.DATA, (chunk: UploadImageRequest) => {
            chunks.push(chunk.getBinary_asU8());
        });
        call.on(READABLE_STREAM_EVENT.END, async () => {
            const desiredSize = { width: 250, height: 250 }; // consider getting these values in request
            const imageBuff = Buffer.concat(chunks);
            const resized = await ImageService.resize(imageBuff, desiredSize.width, desiredSize.height);
            // you may want to replace this with a S3 pipe etc.
            await DiskService.write(resized, `./assets/image_raw_${desiredSize.width}x${desiredSize.height}.png`);

            res.setUrl('https://mydomain.com/resized_image.png');
            callback(null, res);
        });
        call.on(READABLE_STREAM_EVENT.ERROR, (err: Error) => {
            console.error(err);
            callback(err, res);
        });
    }
}
