const multer = require('multer');

const postImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './utils/postImages');
  },
  filename: (req, file, cb) => {
    console.log(file, 'fileee :/');
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  }
});

const uploadPostImage = multer({ storage: postImageStorage });

const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './utils/profileImages');
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  }
});

const uploadProfileImage = multer({ storage: profileImageStorage });

module.exports = { uploadPostImage, uploadProfileImage };
