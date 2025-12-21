# Quick Start Guide - File Upload Feature

## 🚀 Getting Started

### Prerequisites
- Node.js v20+ installed
- npm v9+ installed

### Installation

**1. Install Backend Dependencies**
```bash
cd Backend
npm install
```
✅ Already completed! Dependencies include:
- `pdf-parse` - PDF text extraction
- `mammoth` - DOCX text extraction  
- `multer` - File upload handling

**2. Install Frontend Dependencies** (if not already done)
```bash
cd Frontend
npm install
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd Backend
npm start
# Server runs on http://localhost:8080
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
# App runs on http://localhost:5173
```

## 📝 Using File Upload

### Step 1: Open the App
- Navigate to http://localhost:5173
- Create a new conversation (or use existing)

### Step 2: Upload a File
**Option A - Drag & Drop:**
- Drag a PDF or DOCX file into the upload area
- Drop to upload

**Option B - File Picker:**
- Click the "Upload PDF or DOCX" button
- Select file from your computer

### Step 3: Confirm Upload
- File is processed and shows:
  - 📄 File icon (📄 for PDF, 📝 for DOCX)
  - File name
  - Text size extracted (in KB)

### Step 4: Ask Questions
- Type questions in the chat
- The AI agent has access to the file content
- Ask for specific information from the file

### Step 5: Remove File (Optional)
- Click the "✕" button on the file card
- File is removed from the conversation
- Upload a new file if needed

## 📋 File Requirements

| Requirement | Details |
|------------|---------|
| **Format** | PDF (.pdf), Word (.docx, .doc) |
| **Max Size** | 25 MB |
| **Per Chat** | 1 file at a time |
| **Storage** | In-memory (cleared on refresh) |

## 🎯 Example Use Cases

### Case 1: Document Analysis
1. Upload a PDF report
2. Ask: "Summarize the key findings"
3. Ask: "What are the recommendations?"
4. Ask: "Extract all statistics"

### Case 2: Word Document Q&A
1. Upload a DOCX document
2. Ask: "Who is mentioned in section 3?"
3. Ask: "What are the dates mentioned?"
4. Ask: "List all action items"

### Case 3: Technical Specifications
1. Upload technical documentation
2. Ask: "What are the system requirements?"
3. Ask: "List all supported formats"
4. Ask: "Explain the architecture"

## 🔍 Checking if It Works

### Backend Verification
```bash
# Check if upload endpoint is accessible
curl -X GET http://localhost:8080/api/health
```

### Frontend Verification
- Look for the upload area below chat window
- Should show dashed border with "Upload PDF or DOCX"
- Drag-drop area should activate on hover

### File Processing Verification
1. Upload a test file
2. Check browser console (F12) for success message
3. Check backend server logs for parsing confirmation
4. File info card should display with preview

## 🐛 Common Issues & Solutions

### Issue: Upload button doesn't appear
**Solution:**
- Clear browser cache
- Refresh the page
- Check if FileUpload component loaded

### Issue: File upload fails
**Solution:**
- Verify file is PDF or DOCX
- Check file size (max 25 MB)
- Ensure backend is running
- Check browser console for errors

### Issue: AI doesn't use file content
**Solution:**
- Verify file uploaded successfully
- Try asking direct questions about the file
- Check that threadId is consistent
- Restart backend and try again

### Issue: Dependencies not installing
**Solution:**
```bash
cd Backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 📚 API Reference Quick Summary

```
POST /api/upload
- Uploads and parses a file
- Returns: file metadata and text preview

GET /api/file/:threadId  
- Gets file information
- Returns: filename, type, text length

DELETE /api/file/:threadId
- Removes uploaded file
- Returns: success message
```

## 🎨 UI Components

### FileUpload.jsx
- Location: `Frontend/src/components/FileUpload.jsx`
- Props:
  - `threadId`: Current conversation ID
  - `onFileUpload`: Callback when file uploaded
  - `onFileRemove`: Callback when file removed
  - `uploadedFile`: Current file data

### Usage in ChatWindow.jsx
```jsx
<FileUpload 
  threadId={currThreadId}
  onFileUpload={setUploadedFile}
  onFileRemove={() => setUploadedFile(null)}
  uploadedFile={uploadedFile}
/>
```

## 📊 File Structure

```
Backend/
├── utils/
│   └── fileParser.js          (NEW)
├── routes/
│   ├── chat.js               (MODIFIED)
│   └── fileUpload.js         (NEW)
├── agents/
│   └── sigmaAgent.js         (MODIFIED)
├── server.js                 (MODIFIED)
└── package.json              (MODIFIED)

Frontend/
├── src/
│   ├── components/
│   │   └── FileUpload.jsx    (NEW)
│   ├── styles/
│   │   └── FileUpload.css    (NEW)
│   └── ChatWindow.jsx        (MODIFIED)
```

## 🚨 Important Notes

1. **Files are not persisted** - They're stored in memory and cleared on page refresh
2. **One file per chat** - Upload a new file to replace the existing one
3. **Thread ID required** - Files are associated with specific conversations
4. **No database writes** - Files not stored in MongoDB (by design)
5. **Security** - Only PDF and DOCX files accepted for safety

## 📞 Need Help?

1. **Check logs:**
   - Backend: Check terminal for server logs
   - Frontend: Open DevTools (F12) → Console tab

2. **Verify setup:**
   - Both servers running?
   - Port 8080 and 5173 available?
   - Dependencies installed?

3. **Read documentation:**
   - `FILE_UPLOAD_DOCUMENTATION.md` - Detailed guide
   - `IMPLEMENTATION_SUMMARY.md` - Overview of changes

## ✅ Success Checklist

- [ ] Backend npm install completed
- [ ] Frontend npm install completed
- [ ] Backend server running on port 8080
- [ ] Frontend running on port 5173
- [ ] Can see upload area in chat window
- [ ] Can upload a PDF file
- [ ] File shows metadata after upload
- [ ] Can ask questions and AI responds with file context
- [ ] Can remove file and upload new one

---

**Ready to test?** Start with the running instructions above! 🎉
