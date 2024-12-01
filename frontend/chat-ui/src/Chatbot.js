import React, { useState } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot = () => {
  const [userMessage, setUserMessage] = useState("");
  const [output, setOutput] = useState(""); // To display responses

  // Handle chat interaction
  const handleSendMessage = async () => {
    if (!userMessage.trim()) {
      setOutput("Please enter a message.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/chat", { userMessage });
      console.log("Server response:", response.data); // Log server response for debugging
      setOutput(response.data.reply); // Display the chatbot's response
    } catch (error) {
      console.error("Error in chat interaction:", error.response?.data || error.message);
      setOutput("Error communicating with the chatbot. Please try again.");
    }
  };

  return (
    <div className="container">
      <h1 className="title">Text Processor</h1>

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
