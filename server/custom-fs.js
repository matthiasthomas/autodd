const fs = require('fs-extra');
const path = require('path');

let image_info_cached = null;

function readImageInfoFile() {
    if(image_info_cached) return image_info_cached;
    const image_info = path.join(global.root_path, 'image.info.json');
    if(fs.existsSync(image_info)) {
        image_info_cached = JSON.parse(fs.readFileSync(image_info, 'utf8'));
        return image_info_cached;
    } else {
        return null;
    }
}

function forceReadImageInfoFile() {
    image_info_cached = null;
    return readImageInfoFile();
}

module.exports = {
    forceReadImageInfoFile: forceReadImageInfoFile,
    readImageInfoFile: readImageInfoFile 
};