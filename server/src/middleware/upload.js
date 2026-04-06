const multer = require("multer");

// Los archivos se guardan en memoria y luego se suben a Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
});

module.exports = upload;
