// server/utils/multerDocs.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ALLOWED = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // per-tutor folder: /uploads/verification/tutor_123
    const tutorId = req.user?.tutor_id || "unknown";
    const base = path.join(__dirname, "..", "uploads", "verification", `tutor_${tutorId}`);
    fs.mkdirSync(base, { recursive: true });
    cb(null, base);
  },
  filename: (req, file, cb) => {
    // keep the field name in filename for clarity
    const ext = path.extname(file.originalname);
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9_\-\.]/gi, "_")
      .slice(0, 80);
    cb(null, `${Date.now()}_${file.fieldname}_${safeBase}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Unsupported file type. Upload PDF/JPG/PNG/WebP."));
}

const uploadDocs = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 6,                  // safety net
  },
});

module.exports = uploadDocs;