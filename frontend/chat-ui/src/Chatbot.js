// import React, { useState } from "react";
// import axios from "axios";
// import "./Chatbot.css";

// const Chatbot = () => {
//   const [userMessage, setUserMessage] = useState("");
//   const [output, setOutput] = useState(""); // To display responses

//   // Handle chat interaction
//   const handleSendMessage = async () => {
//     if (!userMessage.trim()) {
//       setOutput("Please enter a message.");
//       return;
//     }

//     try {
//       const response = await axios.post("http://localhost:3001/chat", { userMessage });
//       console.log("Server response:", response.data); // Log server response for debugging
//       setOutput(response.data.reply); // Display the chatbot's response
//     } catch (error) {
//       console.error("Error in chat interaction:", error.response?.data || error.message);
//       setOutput("Error communicating with the chatbot. Please try again.");
//     }
//   };

//   return (
//     <div className="container">
//       <h1 className="title">Text Processor</h1>

//       {/* User Message Section */}
//       <div className="message-section">
//         <textarea
//           className="message-input"
//           placeholder="Type your message here..."
//           value={userMessage}
//           onChange={(e) => setUserMessage(e.target.value)}
//         />
//         <button className="send-button" onClick={handleSendMessage}>
//           Send
//         </button>
//       </div>

//       {/* Output Container */}
//       <div className="output-container">
//         <h2 className="output-title">Output</h2>
//         <p className="output-text">{output || "Your output will appear here."}</p>
//       </div>
//     </div>
//   );
// };

// export default Chatbot;


import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [prompt, setPrompt] = useState('');
  const [promptResponses, setPromptResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch existing conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('http://localhost:3001/conversations');
      setPromptResponses(response.data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:3001/translate', { prompt });
      
      // Update state with new conversation
      const newConversation = {
        prompt: prompt,
        response: response.data.response
      };
      
      setPromptResponses(prev => [...prev, newConversation]);
      setPrompt(''); // Clear input after submission
    } catch (err) {
      console.error('Translation error:', err);
      setError('Failed to translate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Gemini Translator
        </h1>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Enter text to translate..."
            required
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Translate'
            )}
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            {error}
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Previous Conversations
          </h2>
          {promptResponses.length === 0 ? (
            <p className="text-gray-500 text-center">No conversations yet</p>
          ) : (
            <div className="space-y-4">
              {promptResponses.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <div className="mb-2">
                    <span className="font-bold text-gray-700">Prompt: </span>
                    <span className="text-gray-600">{item.prompt}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700">Response: </span>
                    <span className="text-gray-600">{item.response}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;