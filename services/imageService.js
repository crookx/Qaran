const sharp = require('sharp');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
    }
  }
});

class ImageService {
  static async processAndSave(file, options = {}) {
    const {
      width = 800,
      height = 800,
      quality = 80,
      format = 'webp'
    } = options;

    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${format}`;
    const filepath = path.join(__dirname, '../public/uploads', filename);

    await sharp(file.buffer)
      .resize(width, height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFormat(format, { quality })
      .toFile(filepath);

    return {
      url: `/uploads/${filename}`,
      filename
    };
  }

  static async generateThumbnail(file) {
    return this.processAndSave(file, {
      width: 200,
      height: 200,
      quality: 60
    });
  }

  static async deleteImage(filename) {
    const filepath = path.join(__dirname, '../public/uploads', filename);
    await fs.unlink(filepath);
  }
}

module.exports = {
  ImageService,
  upload
};