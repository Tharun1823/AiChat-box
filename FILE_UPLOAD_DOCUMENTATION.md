# File Upload Integration Documentation

## Overview
This document describes the file upload feature that has been integrated into SigmaGPT. Users can now upload PDF and DOCX files to enhance their conversations with the AI agent.

## Architecture

### File Processing Flow
```
User Upload → Multer (File Handler) → FileParser (Text Extraction) → In-Memory Storage → AI Agent Context
```

### Components Added

#### Backend Components

1. **Backend/utils/fileParser.js**
   - `parseUploadedFile(buffer, fileName)` - Parses PDF/DOCX and extracts text
   - `validateFile(file)` - Validates file type and size
   - Uses `pdf-parse` for PDFs and `mammoth` for DOCX files

2. **Backend/routes/fileUpload.js**
   - `POST /api/upload` - Upload and parse a file
   - `GET /api/file/:threadId` - Retrieve file metadata
   - `GET /api/file/:threadId/content` - Get full file content
   - `DELETE /api/file/:threadId` - Remove uploaded file
   - Exports `fileStore` Map for cross-route access

3. **Backend/routes/chat.js** (Modified)
   - Updated `/api/chat` endpoint to include file context
   - Retrieves file content from fileStore and passes to agent
   - File context is included in the system prompt

4. **Backend/agents/sigmaAgent.js** (Modified)
   - `processWithAgent()` now accepts optional `fileContext` parameter
   - Combines vector search results with file content
   - File content augments RAG capabilities

#### Frontend Components

1. **Frontend/src/components/FileUpload.jsx**
   - Drag-and-drop file upload interface
   - File picker button
   - Upload progress indication
   - File metadata display
   - Remove file functionality
   - Error handling and validation

2. **Frontend/src/styles/FileUpload.css**
   - Styled upload area with drag-active state
   - File info display card
   - Responsive design for mobile devices
   - Loading spinner animation

3. **Frontend/src/ChatWindow.jsx** (Modified)
   - Integrated FileUpload component above chat input
   - File state management with `uploadedFile`
   - Callbacks for file upload/removal

## Dependencies

### Added to Backend/package.json:
```json
{
  "pdf-parse": "^1.1.1",      // PDF text extraction
  "mammoth": "^1.8.0",         // DOCX text extraction
  "multer": "^1.4.5-lts.1"     // File upload handling
}
```

## API Endpoints

### Upload File
```http
POST /api/upload
Content-Type: multipart/form-data

Request:
- file: File (PDF or DOCX)
- threadId: string (conversation ID)

Response:
{
  "success": true,
  "file": {
    "fileName": "document.pdf",
    "fileType": "pdf",
    "textLength": 5432,
    "preview": "First 500 characters of extracted text..."
  }
}
```

### Get File Metadata
```http
GET /api/file/:threadId

Response:
{
  "success": true,
  "file": {
    "fileName": "document.pdf",
    "fileType": "pdf",
    "textLength": 5432,
    "uploadedAt": "2024-12-21T10:30:00Z"
  }
}
```

### Get File Content (for AI agent)
```http
GET /api/file/:threadId/content

Response:
{
  "success": true,
  "fileName": "document.pdf",
  "fileType": "pdf",
  "content": "Full extracted text content..."
}
```

### Delete File
```http
DELETE /api/file/:threadId

Response:
{
  "success": true,
  "message": "File removed successfully"
}
```

## Configuration

### File Constraints
- **Max Size**: 25 MB per file
- **Supported Types**: PDF (.pdf), Word (.docx, .doc)
- **Files per Conversation**: 1
- **Storage**: In-memory (session-based, not persistent)

### Environment
No additional environment variables required. Uses existing `VITE_API_URL` config.

## Usage

### For Users

1. **Upload a File**
   - Drag and drop a PDF or DOCX file into the upload area
   - OR click the upload button to browse and select a file
   - File is processed and its content becomes available to the AI

2. **Ask Questions**
   - Type questions and the AI agent will have access to the file content
   - File content augments the vector search results
   - Reference specific parts of the document in your questions

3. **Remove File**
   - Click the "×" button on the file info card to remove it
   - Upload a new file to replace it

### For Developers

#### Backend Usage
```javascript
// In chat.js, file context is automatically included:
const agentResponse = await processWithAgent(message, chatHistory, null, fileContext);
```

#### Frontend Usage
```jsx
<FileUpload 
  threadId={currThreadId}
  onFileUpload={setUploadedFile}
  onFileRemove={() => setUploadedFile(null)}
  uploadedFile={uploadedFile}
/>
```

## Data Flow

### Upload Process
1. User selects file (drag-drop or file picker)
2. Frontend validates file type and size
3. FormData with file + threadId sent to `/api/upload`
4. Backend validates file
5. File parsed (text extracted)
6. Parsed content stored in `fileStore` Map (keyed by threadId)
7. Preview returned to frontend
8. File info displayed in UI

### Chat Process with File
1. User sends message to `/api/chat`
2. Backend retrieves file content from `fileStore`
3. File content formatted as `[Uploaded File Context]`
4. File context passed to `processWithAgent()`
5. AI agent receives file context in system prompt
6. Response includes file-informed analysis

## Error Handling

### Frontend Validation
- File type check (only PDF/DOCX)
- File size check (max 25 MB)
- User-friendly error messages

### Backend Validation
- File presence check
- Thread ID validation
- Parser error handling
- File not found errors

## Security Considerations

1. **File Type Validation**: Only PDF and DOCX accepted
2. **Size Limits**: 25 MB maximum to prevent resource exhaustion
3. **In-Memory Storage**: Files not persisted to disk (security + privacy)
4. **ThreadId Association**: Files linked to specific conversations
5. **API Isolation**: Upload endpoint separate from chat endpoint

## Performance Notes

- **Text Extraction**: Fast for typical documents (< 1 second)
- **Memory Usage**: File content stored per thread (25MB max)
- **Vector Augmentation**: File content combined with vector search results
- **No Database Writes**: In-memory storage for speed and privacy

## Limitations & Future Enhancements

### Current Limitations
- Single file per conversation (by design)
- In-memory storage only (cleared on app restart)
- No file indexing in vector store (by design)
- No file metadata in conversation history

### Potential Enhancements
1. Multi-file support per conversation
2. Persistent file storage (S3, MongoDB GridFS)
3. File indexing in Pinecone for better RAG
4. File upload progress percentage
5. Multiple document types (.pptx, .xlsx, etc.)
6. File annotations and highlighting
7. File version history

## Testing

### Manual Testing Steps

1. **Start Backend**
   ```bash
   cd Backend
   npm install
   npm start
   ```

2. **Start Frontend**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

3. **Test Upload**
   - Create a sample PDF or DOCX file
   - Open the app and create a conversation
   - Upload the file using drag-drop or file picker
   - Verify file info is displayed

4. **Test AI Integration**
   - Ask questions about the uploaded file
   - Verify AI has access to file content
   - Test with different file types and sizes

5. **Test File Removal**
   - Click the remove button
   - Verify file is removed and upload area reappears

## Troubleshooting

### File Upload Fails
- Check file size (max 25 MB)
- Verify file type is PDF or DOCX
- Check browser console for error details
- Ensure backend is running and accessible

### AI Not Using File Content
- Verify file uploaded successfully
- Check server logs for fileStore operations
- Ensure threadId is consistent
- Test with simpler file content first

### Files Disappear After Refresh
- This is expected behavior (in-memory storage)
- Files are cleared when page refreshes
- Implement persistent storage if needed

## Files Modified

1. `Backend/package.json` - Added dependencies
2. `Backend/routes/chat.js` - File context integration
3. `Backend/agents/sigmaAgent.js` - File context parameter
4. `Backend/server.js` - Registered file upload routes
5. `Frontend/src/ChatWindow.jsx` - Added FileUpload component
6. `Frontend/src/components/FileUpload.jsx` - **New file**
7. `Frontend/src/styles/FileUpload.css` - **New file**

## Files Created

1. `Backend/utils/fileParser.js` - File parsing utilities
2. `Backend/routes/fileUpload.js` - File upload API endpoints
3. `Frontend/src/components/FileUpload.jsx` - Upload UI component
4. `Frontend/src/styles/FileUpload.css` - Upload component styles

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server/browser console logs
3. Verify file format and size constraints
4. Test with sample PDF/DOCX files from trusted sources
