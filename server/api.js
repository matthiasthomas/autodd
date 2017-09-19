var multer = require('multer');
var fs = require('fs');

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
        return res.status(200).send({
            message: 'Image uploaded!'
        });
    });
};