import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Chatbot.css";
import html2pdf from 'html2pdf.js';
import { marked } from "marked";

const Chatbot = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [selectedStandard, setSelectedStandard] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOutputGenerated, setIsOutputGenerated] = useState(false);

  const predefinedPrompts = {
    "Global Reporting Initiative (GRI)":
      "Using the provided data, generate a GRI compliant report with material topics highlighted and interpret the data. Do not stop until the entire data is processed.",
    "Business Responsibility and Sustainability Reporting (BRSR)":
      "Using the provided data, generate a BRSR compliant report with material topics highlighted and interpret the data. Do not stop until the entire data is processed.",
    "Sustainability Accounting Standards Board (SASB)":
      "Using the provided data, generate a SASB compliant report with material topics highlighted and interpret the data. Do not stop until the entire data is processed.",
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!pdfFile || !selectedStandard) {
      setOutput("Please upload a PDF file then select a standard.");
      return;
    }

    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("standardPrompt", predefinedPrompts[selectedStandard]);

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3001/upload",
        formData
      );

      // Process the output using formatOutput
      const formattedOutput = formatOutput(response.data.reply);
      setOutput(formattedOutput);
      setIsOutputGenerated(true);
    } catch (error) {
      setOutput("Error processing the request. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  // Handle standard selection
  const handleStandardClick = (standard) => {
    setOutput("");
    setIsOutputGenerated(false);
    setLoading(false);
  
    setSelectedStandard(standard);
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

    resetPDFContent(); 
  }, []);

  const handleDownload = () => {
  if (!output) {
    alert("No output to download.");
    return;
  }

  // Create a div to contain the formatted output
  const outputDiv = document.createElement("div");
  outputDiv.innerHTML = output;

  // Apply styling to ensure proper word wrap and page handling
  outputDiv.style.fontFamily = "Arial, sans-serif";
  outputDiv.style.fontSize = "16px";
  outputDiv.style.lineHeight = "1.8";
  outputDiv.style.textAlign = "left";

  // Append the div to the document body (it won't be visible)
  document.body.appendChild(outputDiv);

  // Set up html2pdf options for page handling
  const options = {
    margin: 10,
    filename: 'generated_report.pdf',
    image: { type: 'jpeg', quality: 0.99 },
    html2canvas: { dpi: 192, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] }, // Enable page breaks based on CSS
  };

  html2pdf().from(outputDiv).set(options).save();

  // Remove the div after PDF generation to clean up the DOM
  document.body.removeChild(outputDiv);
};
  
  return (
    <div className="container">
      {/* Left side - Upload and Standard Selection */}
      <div className="left-side">
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
            {Object.keys(predefinedPrompts).map((standard) => (
              <button
                key={standard}
                className={`standard-button ${
                  selectedStandard === standard ? "active" : ""
                }`}
                onClick={() => handleStandardClick(standard)}
              >
                {standard}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button className="submit-button" onClick={handleFileUpload}>
          Submit
        </button>
      </div>      

      {/* Right side - Output Area */}
      <div className="right-side">
        <div className="output-container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <div
              className="output-text"
              dangerouslySetInnerHTML={{
                __html: output || "Your output will appear here.",
              }}
            ></div>
          )}
        </div>
        {isOutputGenerated && (
          <button className="download-button" onClick={handleDownload}>
            Download PDF
          </button>
        )}
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
