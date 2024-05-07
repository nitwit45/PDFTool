import React, { useState, useEffect } from "react";
import { Form, Button, ListGroup, Modal } from "react-bootstrap";
import { Document, Page, pdfjs } from "react-pdf";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import axios from "axios";
import "./form.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes} min ${remainingSeconds} sec`;
};

const Forms = () => {
  const [showModal, setShowModal] = useState(false);
  const [showGlossaryModal, setShowGlossaryModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedWord, setSelectedWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [viewFile, setViewFile] = useState(null);
  const [notes, setNotes] = useState({});
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState("");
  const [showFileList, setShowFileList] = useState(true);
  const [showUploadArea, setShowUploadArea] = useState(true);
  const [glossary, setGlossary] = useState([]);
  const [glossaryWithDefinitions, setGlossaryWithDefinitions] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [showQuizContainer, setShowQuizContainer] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  

  const handleHideQuizContainer = () => {
    setShowQuizContainer(false);
  };

  const handleNextQuestion = () => {
    // Increment the current question index
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const generateQuiz = async () => {
    try {
      setShowQuizContainer(true);
      const response = await axios.get("http://localhost:5000/generateQuiz");
      setQuizQuestions(response.data);
    } catch (error) {
      console.error("Error generating quiz:", error);
    }
  };

  const startTimer = () => {
    setStartTime(Date.now());
  };

  const stopTimer = () => {
    if (startTime) {
      const currentTime = Date.now();
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
      setElapsedTime(elapsedTime + elapsedSeconds);
      setStartTime(null);
    }
  };

  const resetTimer = () => {
    setStartTime(null);
    setElapsedTime(0);
  };

  useEffect(() => {
    // Save elapsed time to local storage whenever it changes
    localStorage.setItem("elapsedTime", JSON.stringify(elapsedTime));
  }, [elapsedTime]);

  useEffect(() => {
    // Start the timer when pdfUrl changes
    if (pdfUrl) {
      startTimer();
    }

    // Clean up timer when component unmounts
    return () => {
      stopTimer();
    };
  }, [pdfUrl]);

  // Listen for the onLoadSuccess event to stop the timer when a new PDF is loaded
  const handleLoadSuccess = ({ numPages }) => {
    stopTimer();
    setNumPages(numPages);  // Assuming you also want to update numPages when a new PDF is loaded
  };
  
  const getDefinition = async (word) => {
    try {
      const response = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en_US/${word}`
      );
      const meanings = response.data[0]?.meanings;

      if (meanings && meanings.length > 0) {
        return meanings[0]?.definitions[0]?.definition;
      } else {
        console.log(`Definition not found for ${word}.`);
        return null;
      }
    } catch (error) {
      console.error("Error fetching definition:", error);
      return null;
    }
  };

  const handleToggleUploadArea = () => {
    setShowUploadArea(!showUploadArea);
  };

  const handleToggleFileList = () => {
    setShowFileList(!showFileList);
  };

  const handleTextSelection = (event) => {
    event.preventDefault();
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText) {
      setSelectedWord(selectedText);
    }
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleDefine = async () => {
    if (selectedWord) {
      try {
        const response = await axios.get(
          `https://api.dictionaryapi.dev/api/v2/entries/en_US/${selectedWord}`
        );

        const meanings = response.data[0]?.meanings;

        if (meanings && meanings.length > 0) {
          const definition = meanings[0]?.definitions[0]?.definition;
          setDefinition(definition);
          toggleModal();
        } else {
          console.log(`Definition not found for ${selectedWord}.`);
        }
      } catch (error) {
        console.error("Error fetching definition:", error);
      }
    } else {
      console.log("No word selected to define.");
    }
  };

  const handleAddToGlossary = () => {
    if (selectedWord) {
      setGlossary((prevGlossary) => [...prevGlossary, selectedWord]);
    }
  };

  const handleViewGlossary = async () => {
    setShowGlossaryModal(!showGlossaryModal);

    const glossaryWithDefinitions = await Promise.all(
      glossary.map(async (word) => {
        const definition = await getDefinition(word);
        return { word, definition };
      })
    );

    setGlossaryWithDefinitions(glossaryWithDefinitions);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      const fileData = {
        name: file.name,
        content: reader.result,
      };
      setUploadedFiles((prevFiles) => [...prevFiles, fileData]);
      setSelectedFile(file);
      setPdfUrl(URL.createObjectURL(file));
      setSelectedNotes("");
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      await axios.post("http://localhost:5000/upload", formData);

    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const handleViewFile = async (file) => {
    try {
      const response = await axios.get(`http://localhost:5000/uploads/${file.name}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      setViewFile(blob);
      setPdfUrl(URL.createObjectURL(blob));
      setSelectedFile(file);
      const pdfKey = file ? file.name : null;
      setSelectedNotes(notes[pdfKey] || '');
  
      // Set the currently viewed PDF with file path on the backend
      await axios.post("http://localhost:5000/setCurrentlyViewedPDF", { 
        filename: file.name,
        filepath: `http://localhost:5000/uploads/${file.name}`
      });
    } catch (error) {
      console.error("Error fetching file:", error);
    }
  };

  const handleNotesButtonClick = () => {
    setShowNotesPanel(!showNotesPanel);
  };

  const handleNotesChange = (event) => {
    const pdfKey = selectedFile ? selectedFile.name : null;
    const newNotes = event.target.value;
    setNotes((prevNotes) => ({
      ...prevNotes,
      [pdfKey]: newNotes,
    }));
    setSelectedNotes(newNotes);
    localStorage.setItem("notes", JSON.stringify(notes));
  };

  const getNotesForCurrentPDF = () => {
    const pdfKey = selectedFile ? selectedFile.name : null;
    return notes[pdfKey] || '';
  };

  useEffect(() => {
    const storedNotes = localStorage.getItem("notes");
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }
  }, []);

  useEffect(() => {
    const fetchUploadedFiles = async () => {
      try {
        const response = await axios.get("http://localhost:5000/getUploadedFiles");
        setUploadedFiles(response.data);
      } catch (error) {
        console.error("Error fetching uploaded files:", error);
      }
    };

    fetchUploadedFiles();
  }, []);

  

  return (
    <div className="form1">
      <Container>
        <Row>
          <Col>
            <Button className="hidebuttons" variant="secondary" onClick={() => setShowUploadArea(!showUploadArea)}>
              {showUploadArea ? "Hide Upload Area" : "Show Upload Area"}
            </Button>
            <div>
              <br></br>
            </div>
            <Button className="hidebuttons" variant="secondary" onClick={handleToggleFileList}>
              {showFileList ? "Hide File List" : "Show File List"}
            </Button>
            {showFileList && (
              <>
                <div>
                  <br />
                </div>
                <ListGroup>
                  {uploadedFiles.map((file, index) => (
                    <ListGroup.Item key={index}>
                      {file.name}
                      <Button variant="secondary" onClick={() => handleViewFile(file)}>
                        View
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </>
            )}
          </Col>
          <Col xs={10}>
            {showUploadArea && (
              <div className="sub-container">
                <Form>
                  <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Choose a PDF file</Form.Label>
                    <Form.Control type="file" accept=".pdf" onChange={handleFileChange} />
                  </Form.Group>
                  <Button variant="primary" onClick={handleUpload}>
                    Upload
                  </Button>
                </Form>
              </div>
            )}
            <div>
              <br />
              <br />
              <br />
            </div>
            <div>
            {pdfUrl && (
            <p>Reading Time: {formatTime(elapsedTime)}</p>
            )}         
            </div>
            {pdfUrl && (
              <div>
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onMouseUp={handleTextSelection}
                >
                  <Page pageNumber={pageNumber} width={800} />
                </Document>
                <p>
                  Page {pageNumber} of {numPages}
                </p>
                <div>
                  <br />
                </div>
                <div className="mb-3">
                  <Button variant="secondary" onClick={handlePreviousPage}>
                    Previous Page
                  </Button>{" "}
                  <Button variant="secondary" onClick={handleNextPage}>
                    Next Page
                  </Button>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>
      <div className="mb-3">
        <Button variant="primary" onClick={handleDefine} className="mx-2">
          Define
        </Button>
        <button className="notes-button mx-2" onClick={handleNotesButtonClick}>
          Notes
        </button>
        <Button variant="success" onClick={handleAddToGlossary} className="mx-2">
          Add To Glossary
        </Button>
        <Button variant="info" onClick={handleViewGlossary} className="mx-2">
          View Glossary
        </Button>
        {showNotesPanel && (
          <div className="notes-panel">
            <textarea
              placeholder="Enter your notes here..."
              value={getNotesForCurrentPDF()}
              onChange={handleNotesChange}
            />
          </div>
        )}
      </div>
      <Modal show={showModal} onHide={toggleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Definition</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedWord ? (
            <p>
              <strong>{selectedWord}:</strong> {definition}
            </p>
          ) : (
            <p>No word selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={toggleModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showGlossaryModal} onHide={handleViewGlossary}>
        <Modal.Header closeButton>
          <Modal.Title>Glossary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {glossaryWithDefinitions.length > 0 ? (
            <ul>
              {glossaryWithDefinitions.map((item, index) => (
                <li key={index}>
                  <strong>{item.word}:</strong>{" "}
                  {item.definition ? item.definition : "Definition not found"}
                </li>
              ))}
            </ul>
          ) : (
            <p>No words in the glossary.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleViewGlossary}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Col>
        <Button variant="primary" onClick={generateQuiz} className="mx-2">
          Generate Quiz
        </Button>
      </Col>
      {/* New Container for Quiz */}
      {showQuizContainer && (
        <Container className="quiz-container">
          {quizQuestions.length > 0 && (
            <div>
              <h3>Quiz Questions</h3>
              <br></br>
              <h5>{quizQuestions[0]}</h5>
              <hr></hr>
              {quizQuestions[1].map((option, index) => (
                <Row key={index} className="mb-2">
                  <Col>{option}<hr></hr></Col>
                  <Col xs="auto">
                    <Form.Check
                      type="radio"
                      label=""
                      name={`question_${quizQuestions[0]}`}
                      inline
                    />
                  </Col>
                </Row>
              ))}
            </div>
          )}
          <div className="quiz-controls">
            <Row>
              <Col xs="auto">
                <Button variant="secondary" onClick={handleHideQuizContainer}>
                  Hide Quiz
                </Button>
              </Col>
              <Col className="text-end">
                <Button variant="primary" onClick={handleNextQuestion}>
                  Next Question
                </Button>
              </Col>
            </Row>
          </div>
        </Container>
      )}
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
    </div>
  );
};

export default Forms;
