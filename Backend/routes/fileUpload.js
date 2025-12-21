import express from 'express';
import multer from 'multer';
import { parseUploadedFile, validateFile } from '../utils/fileParser.js';

const router = express.Router();

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB
    }
});

// Store uploaded files in memory by threadId
export const fileStore = new Map(); // threadId -> file data

/**
 * POST /api/upload
 * Upload and parse a file (PDF or DOCX)
 * Response: { success: true, file: { fileName, fileType, textLength, preview } }
 */
router.post('/upload', upload.single('file'), async (req, res) => {
    const { threadId } = req.body;

    try {
        // Validate inputs
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'No file uploaded' 
            });
        }

        if (!threadId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Thread ID is required' 
            });
        }

        // Validate file
        const validation = validateFile(req.file);
        if (!validation.valid) {
            return res.status(400).json({ 
                success: false, 
                error: validation.error 
            });
        }

        // Parse the file
        const parsedFile = await parseUploadedFile(req.file.buffer, req.file.originalname);

        // Store file data in memory linked to threadId
        fileStore.set(threadId, {
            fileName: parsedFile.fileName,
            fileType: parsedFile.fileType,
            fullText: parsedFile.text,
            uploadedAt: new Date(),
            textLength: parsedFile.text.length
        });

        // Create preview (first 500 characters)
        const preview = parsedFile.text.substring(0, 500) + 
                       (parsedFile.text.length > 500 ? '...' : '');

        res.json({
            success: true,
            file: {
                fileName: parsedFile.fileName,
                fileType: parsedFile.fileType,
                textLength: parsedFile.text.length,
                preview: preview
            }
        });

    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to process file' 
        });
    }
});

/**
 * GET /api/file/:threadId
 * Retrieve uploaded file content for a conversation
 */
router.get('/file/:threadId', (req, res) => {
    const { threadId } = req.params;

    try {
        const fileData = fileStore.get(threadId);
        
        if (!fileData) {
            return res.status(404).json({ 
                success: false, 
                error: 'No file found for this conversation' 
            });
        }

        res.json({
            success: true,
            file: {
                fileName: fileData.fileName,
                fileType: fileData.fileType,
                textLength: fileData.textLength,
                uploadedAt: fileData.uploadedAt
                // Note: fullText is retrieved via getFileContent for security
            }
        });

    } catch (error) {
        console.error('File retrieval error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to retrieve file' 
        });
    }
});

/**
 * GET /api/file/:threadId/content
 * Get full file content (for AI agent use)
 */
router.get('/file/:threadId/content', (req, res) => {
    const { threadId } = req.params;

    try {
        const fileData = fileStore.get(threadId);
        
        if (!fileData) {
            return res.status(404).json({ 
                success: false, 
                error: 'No file found for this conversation' 
            });
        }

        res.json({
            success: true,
            fileName: fileData.fileName,
            fileType: fileData.fileType,
            content: fileData.fullText
        });

    } catch (error) {
        console.error('File content retrieval error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to retrieve file content' 
        });
    }
});

/**
 * DELETE /api/file/:threadId
 * Remove uploaded file from conversation
 */
router.delete('/file/:threadId', (req, res) => {
    const { threadId } = req.params;

    try {
        const deleted = fileStore.delete(threadId);
        
        if (!deleted) {
            return res.status(404).json({ 
                success: false, 
                error: 'No file found for this conversation' 
            });
        }

        res.json({
            success: true,
            message: 'File removed successfully'
        });

    } catch (error) {
        console.error('File deletion error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to remove file' 
        });
    }
});

export default router;
