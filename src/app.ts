import { Server, ServerCredentials } from 'grpc';
import { ImageServiceService } from './types/ImageService_grpc_pb';
import { ImageController } from './controllers/ImageController';

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
