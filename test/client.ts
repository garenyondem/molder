import path from 'path';
//@ts-ignore
import caller from 'grpc-caller';
import fs from 'fs';

const IMAGE_PATH = path.resolve(__dirname, '../assets/image_raw.png');
const PROTO_PATH = path.resolve(__dirname, '../protos/ImageService.proto');
const HOST = '0.0.0.0:50055';
const NUMBER_OF_UPLOADS = 10;

export default async function main() {
    const stub = createClientStub();
    try {
        const uploads = populateUploads(stub, IMAGE_PATH);
        await Promise.all(uploads);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

async function uploadImage(stub: any, imagePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const { call, res } = stub.uploadImage();

        res.then((res: any) => {
            console.log({ res });
            resolve(res);
        }).catch((err: any) => {
            reject(err);
        });

        imageReadStream(imagePath)
            .on('data', (chunk) => {
                call.write({
                    binary: chunk,
                });
            })
            .on('end', () => {
                call.end();
            });
    });
}

function imageReadStream(imagePath: string) {
    return fs.createReadStream(imagePath);
}

function createClientStub() {
    //@ts-ignore
    return caller(HOST, PROTO_PATH, 'ImageService');
}

function populateUploads(stub: any, imagePath: string) {
    let uploads = [];
    for (let i = 0; i < NUMBER_OF_UPLOADS; i++) {
        uploads.push(uploadImage(stub, imagePath));
    }
    return uploads;
}
