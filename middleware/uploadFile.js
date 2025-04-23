import multer from 'multer';
import fs from 'fs';
import path from 'path';

const uploadDir = './uploads';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

///////////////////////

const filterProfilePicture = (req, file, cb) => {
  const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const uploadProfilePicture = multer({
  storage: storage,
  fileFilter: filterProfilePicture,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
});

///////////////////////

const filterExcels = (req, file, cb) => {
  const allowedFileTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const uploadExcel = multer({
  storage: storage,
  fileFilter: filterExcels,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB
  },
});

///////////////////////

const filterProductImages = (req, file, cb) => {
  const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const uploadProductImages = multer({
  storage: storage,
  fileFilter: filterProductImages,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB
  },
});

export { uploadProfilePicture, uploadExcel, uploadProductImages };
