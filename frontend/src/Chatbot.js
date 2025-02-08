import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Chatbot.css";
import html2pdf from "html2pdf.js";
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
    formData.append("selectedStandard", selectedStandard); // Send selected standard

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3001/upload",
        formData
      );

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

    const outputDiv = document.createElement("div");
    outputDiv.innerHTML = `
    <style>
      * {
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      table {
        page-break-inside: auto;
      }

      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }

      thead {
        display: table-header-group;
      }

      tfoot {
        display: table-footer-group;
      }

      h1, h2, h3, h4, h5, h6 {
        color: green;
        page-break-after: avoid; 
        break-after: avoid;
      }

      p, div, table {
        page-break-before: avoid;
        break-before: avoid;
      }

      .section {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    </style>
    ${output}
  `;

    outputDiv.style.fontFamily = "Arial , sans-serif";
    outputDiv.style.fontSize = "16px";
    outputDiv.style.lineHeight = "1.2";
    outputDiv.style.textAlign = "left";

    document.body.appendChild(outputDiv);

    const options = {
      margin: 10,
      filename: "generated_report.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        dpi: 300,
        letterRendering: true,
        scale: 2,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    // Generate PDF
    html2pdf().from(outputDiv).set(options).save();

    // Clean up the DOM by removing the outputDiv after PDF generation
    document.body.removeChild(outputDiv);
  };

  return (
    <>
      <title>Sustain360</title>
      <div className="container">
        {/* Left side - Upload and Standard Selection */}
        <div className="left-side">
        <div className="logo-container">
        <img src="/frame.png" alt="Sustain360 Logo" className="logo" />
        </div>

          {/* File Upload Section */}
          <div className="upload-section">
            <label htmlFor="file-input" className="title">
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
    </>
  );
};

function formatOutput(output) {
  let htmlOutput = marked(output);

  htmlOutput = `<div style="text-align: left;">${htmlOutput}</div>`;

  htmlOutput = htmlOutput.replace(
    /<table>/g,
    '<table style="width: 100%; text-align: left;">'
  );
  htmlOutput = htmlOutput.replace(/<th>/g, '<th style="text-align: left;">');
  htmlOutput = htmlOutput.replace(/<td>/g, '<td style="text-align: left;">');

  return htmlOutput;
}

export default Chatbot;
