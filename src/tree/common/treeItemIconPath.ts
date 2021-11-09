import * as fs from 'fs';
import * as path from 'path';
const download = require('image-downloader');

const ROOT_PATH = 'resources';

function pathExists(path: string): boolean {
    try {
      fs.accessSync(path);
    } catch (err) {
      return false;
    }
    return true;
}

export async function downloadIcon(originIconUrl: string, toSubPath: string, id: number): Promise<string> {
    const dest = path.join(__filename, '..', '..', '..', '..', ROOT_PATH, toSubPath, `${id}.png`);
    const flag = pathExists(dest);
    if (!flag) {
        const options = {
            url: originIconUrl,
            dest: dest
        };
        try {
          const { filename } = await download.image(options);
          return filename;
        } catch (error) {
          return '';
        }
    }
    return dest;
}
