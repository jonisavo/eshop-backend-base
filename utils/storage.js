const multer = require('multer');
const { requestBasePath } = require('./request_utils');

const ALLOWED_FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
}

const STORAGE_DESTINATION = 'public/uploads';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, STORAGE_DESTINATION);
  },
  filename: function (req, file, cb) {
    const extension = ALLOWED_FILE_TYPE_MAP[file.mimetype];

    if (extension === undefined) {
      const error = new Error(`Invalid file type, must be one of ${Object.values(ALLOWED_FILE_TYPE_MAP).join(', ')}`)
      cb(error, null);
      return;
    }

    const fileName = `${file.originalname.replace(' ', '_')}-${Date.now()}.${extension}`;

    cb(null, fileName)
  }
});

const upload = multer({ storage });

const getFullStorageFilePath = (req, fileName) => [requestBasePath(req), STORAGE_DESTINATION, fileName].join('/');

module.exports = {
  upload,
  getFullStorageFilePath
};
