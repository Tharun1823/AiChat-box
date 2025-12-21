import "./ChatWindow.css";
import Chat from "./Chat";
import FileUpload from "./components/FileUpload";
import { MyContext } from "./MyContext";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import API_BASE_URL from './config/api.js';

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setCurrThreadId,
    prevChats,
    setPrevChats,
    setNewChat,
  } = useContext(MyContext);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const getReply = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setNewChat(false);
    console.log("Prompt sent:", prompt);
    console.log("Current Thread ID:", currThreadId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: prompt,
            threadId: currThreadId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      
      if (res.error) {
        throw new Error(res.error);
      }
      
      setReply(res.reply || "I couldn't generate a response. Please try again.");
    } catch (error) {
      console.error("Error fetching reply:", error);
      setReply("I apologize, but I encountered an error while processing your request. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (prompt && reply) {
      setPrevChats((prevChats) => [
        ...prevChats,
        {
          role: "user",
          content: prompt,
        },
        {
          role: "assistant",
          content: reply,
        },
      ]);
    }
    setPrompt("");
  }, [reply]);

  return (
    <div className="chatWindow">
      <div className="navbar">
        <span>
          SigmaGpt &nbsp;<i className="fa-solid fa-chevron-down"></i>
        </span>
        <div className="userIconDiv">
          <span className="userIcon">
            <i className="fa-solid fa-user"></i>
          </span>
        </div>
      </div>

      <Chat />

      {isLoading && (
        <div className="loaderContainer">
          <ScaleLoader
            color="#ffffff"
            height={35}
            width={4}
            radius={2}
            margin={2}
            loading={isLoading}
          />
        </div>
      )}

      <div className="chatInput">
        <div className="InputBox">
          <FileUpload 
            threadId={currThreadId}
            onFileUpload={setUploadedFile}
            onFileRemove={() => setUploadedFile(null)}
            uploadedFile={uploadedFile}
          />
          <input
            placeholder="Ask anything..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                getReply();
              }
            }}
            disabled={isLoading}
          />
          <div
            id="submit"
            onClick={getReply}
            style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
          >
            <i className="fa-solid fa-square-arrow-up-right"></i>
          </div>
        </div>
      </div>

      <div>
        <p className="info">SigmaGPT can make mistakes</p>
      </div>
    </div>
  );
}

export default ChatWindow;
