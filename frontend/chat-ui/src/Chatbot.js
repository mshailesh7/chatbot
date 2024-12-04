import React, { useState } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [selectedStandard, setSelectedStandard] = useState("GRI");
  const [userMessage, setUserMessage] = useState("");
  const [output, setOutput] = useState(""); // To display responses

  // Handle file upload
  const handleFileUpload = async () => {
    if (!pdfFile) {
      setOutput("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      const response = await axios.post("http://localhost:3001/upload", formData);
      setOutput(response.data.openAIResponse); // Set OpenAI's response in output
    } catch (error) {
      setOutput("Error uploading PDF. Please try again.");
    }
  };

  // Handle chat interaction
  const handleSendMessage = async () => {
    if (!userMessage.trim()) {
      setOutput("Please enter a message.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/chat", { userMessage });
      setOutput(response.data.reply); // Display OpenAI's reply in output
    } catch (error) {
      setOutput("Error communicating with the chatbot. Please try again.");
    }
  };

  // Handle standard selection
  const handleStandardChange = (event) => {
    setSelectedStandard(event.target.value);
  };

  return (
    <div className="container">
      <h1 className="title">Sustainability Report Generator</h1>

      {/* File Upload Section */}
      <div className="upload-section">
        <label htmlFor="file-input" className="file-label">
          Upload PDF Document
        </label>
        <input
          type="file"
          id="file-input"
          onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
          className="file-input"
        />
      </div>

      {/* Standard Selection Section */}
      <div className="standard-section">
        <p className="standard-title">Select Standard</p>
        <div className="standard-options">
          <label>
            <input
              type="radio"
              name="standard"
              value="GRI"
              checked={selectedStandard === "GRI"}
              onChange={handleStandardChange}
            />
            GRI (Global Reporting Initiative)
          </label>
          <label>
            <input
              type="radio"
              name="standard"
              value="BRSR"
              checked={selectedStandard === "BRSR"}
              onChange={handleStandardChange}
            />
            BRSR (Business Responsibility and Sustainability Reporting)
          </label>
          <label>
            <input
              type="radio"
              name="standard"
              value="SASB"
              checked={selectedStandard === "SASB"}
              onChange={handleStandardChange}
            />
            SASB (Sustainability Accounting Standards Board)
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button className="submit-button" onClick={handleFileUpload}>
        Submit PDF
      </button>

      {/* User Message Section */}
      <div className="message-section">
        <textarea
          className="message-input"
          placeholder="Type your message here..."
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
        />
        <button className="send-button" onClick={handleSendMessage}>
          Send
        </button>
      </div>

      {/* Output Container */}
      <div className="output-container">
        <h2 className="output-title">Output</h2>
        <p className="output-text">{output || "Your output will appear here."}</p>
      </div>
    </div>
  );
};

export default Chatbot;
