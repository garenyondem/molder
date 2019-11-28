import fs from 'fs';
import { promisify } from 'util';
const writeFile = promisify(fs.writeFile);

export class DiskService {
    static write(image: Buffer, path: string): Promise<void> {
        return writeFile(path, image);
    }
}
