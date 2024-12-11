import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Chatbot.css";
import { marked } from "marked";

const Chatbot = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [selectedStandard, setSelectedStandard] = useState("GRI");
  const [userMessage, setUserMessage] = useState("");
  const [output, setOutput] = useState(""); // To display responses
  const [loading, setLoading] = useState(false); // To track processing state
  const [currentDate, setCurrentDate] = useState("");

  // Update current date and time on mount
  useEffect(() => {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(now.toLocaleDateString(undefined, options)); // Localized date
  }, []);

  // Handle file upload
  const handleFileUpload = async () => {
    if (!pdfFile) {
      setOutput("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", pdfFile);

    setLoading(true); // Start loading
    try {
      const response = await axios.post(
        "http://localhost:3001/upload",
        formData
      );
      alert("PDF uploaded and processed successfully!");
      setOutput(response.data.openAIResponse);
    } catch (error) {
      setOutput("Error uploading PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle chat interaction
  const handleSendMessage = async () => {
    if (!userMessage.trim()) {
      setOutput("Please enter a message.");
      return;
    }

    setLoading(true); // Start loading
    try {
      const response = await axios.post("http://localhost:3001/chat", {
        userMessage,
      });
      setOutput(response.data.reply); // Display OpenAI's reply in output
    } catch (error) {
      setOutput("Error communicating with the chatbot. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Handle standard selection
  const handleStandardChange = (event) => {
    setSelectedStandard(event.target.value);
  };

  useEffect(() => {
    const resetPDFContent = async () => {
      try {
        await axios.post("http://localhost:3001/reset");
        console.log("Server PDF content reset successfully.");
      } catch (error) {
        console.error("Error resetting server PDF content:", error);
      }
    };

    resetPDFContent(); // Reset PDF content on page load
  }, []);

  return (
    <div className="container">
      {/* Left side - Report Generator */}
      <div className="left-side">
        <h1 className="title">Sustainability Report Generator</h1>
        <p className="current-date">Today's Date: {currentDate}</p>

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
      </div>

      {/* Right side - Output Area */}
      <div className="right-side">
        <div className="output-container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              <h2 className="output-title">Output</h2>
              <div className="output-text">
                {output ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: formatOutput(output) }}
                  />
                ) : (
                  "Your output will appear here."
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function formatOutput(output) {
  let htmlOutput = marked(output);

  // Ensure everything is aligned to the left by wrapping the content in a div
  htmlOutput = `<div style="text-align: left;">${htmlOutput}</div>`;

  // Additional step to format tables (optional, if you want explicit styling for tables)
  htmlOutput = htmlOutput.replace(
    /<table>/g,
    '<table style="width: 100%; text-align: left;">'
  );
  htmlOutput = htmlOutput.replace(/<th>/g, '<th style="text-align: left;">');
  htmlOutput = htmlOutput.replace(/<td>/g, '<td style="text-align: left;">');

  return htmlOutput;
}

export default Chatbot;
