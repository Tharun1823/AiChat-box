import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';

/**
 * Extract text from PDF file
 * @param {Buffer} fileBuffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
async function parsePDF(fileBuffer) {
    try {
        const data = await pdfParse(fileBuffer);
        return data.text;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to parse PDF file');
    }
}

/**
 * Extract text from DOCX file
 * @param {Buffer} fileBuffer - DOCX file buffer
 * @returns {Promise<string>} Extracted text
 */
async function parseDOCX(fileBuffer) {
    try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        return result.value;
    } catch (error) {
        console.error('Error parsing DOCX:', error);
        throw new Error('Failed to parse DOCX file');
    }
}

/**
 * Parse uploaded file based on type
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @returns {Promise<{text: string, fileName: string, fileType: string}>} Extracted content
 */
export async function parseUploadedFile(fileBuffer, fileName) {
    const extension = path.extname(fileName).toLowerCase();
    
    if (extension === '.pdf') {
        const text = await parsePDF(fileBuffer);
        return {
            text: text.trim(),
            fileName: fileName,
            fileType: 'pdf'
        };
    } else if (extension === '.docx' || extension === '.doc') {
        const text = await parseDOCX(fileBuffer);
        return {
            text: text.trim(),
            fileName: fileName,
            fileType: 'docx'
        };
    } else {
        throw new Error(`Unsupported file type: ${extension}. Only PDF and DOCX are supported.`);
    }
}

/**
 * Validate file before parsing
 * @param {File} file - Multer file object
 * @returns {object} Validation result
 */
export function validateFile(file) {
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
    const ALLOWED_TYPES = ['.pdf', '.docx', '.doc'];
    
    if (!file) {
        return { valid: false, error: 'No file provided' };
    }
    
    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: `File size exceeds 25MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB` };
    }
    
    const extension = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_TYPES.includes(extension)) {
        return { valid: false, error: `Unsupported file type: ${extension}. Only PDF and DOCX are supported.` };
    }
    
    return { valid: true };
}
