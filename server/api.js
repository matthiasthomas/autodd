const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const custom_fs = require('./custom-fs');

module.exports = function(app){
    const DIR = './uploads/';
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, DIR)
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now())
        }
    });
    const upload = multer({ storage: storage })
    
    app.post('/api/image', upload.single('image'), function (req, res) {
        let files = fs.readdirSync(global.root_path, 'utf8');
        for(let file of files) {
            if(file === 'image.img'){
                fs.removeSync(path.join(global.root_path, file));
            }
        }
        fs.renameSync(path.join(global.root_path, 'uploads', req.file.filename), path.join(global.root_path, 'image.img'));
        fs.writeFileSync(path.join(global.root_path, 'image.info.json'), JSON.stringify({
            datetime: moment().format('MMMM Do YYYY, h:mm:ss a'),
            size: fs.statSync(path.join(global.root_path, 'image.img')).size
        }), 'utf8');
        return res.status(200).send({
            message: 'Image uploaded!',
            data: custom_fs.forceReadImageInfoFile()
        });
    });
};