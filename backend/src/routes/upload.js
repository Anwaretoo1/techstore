const express = require('express');
const router = express.Router();
const path = require('path');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /api/upload — Upload images (admin only)
router.post('/', authenticate, requireAdmin, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  const urls = req.files.map((file) => ({
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    originalname: file.originalname,
    size: file.size,
  }));

  res.json({ success: true, data: urls });
});

// DELETE /api/upload/:filename — Delete an image (admin only)
router.delete('/:filename', authenticate, requireAdmin, (req, res) => {
  const fs = require('fs');
  const filePath = path.join(__dirname, '../../uploads', req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'File not found' });
  }

  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Failed to delete file' });
    res.json({ success: true, message: 'File deleted' });
  });
});

module.exports = router;
