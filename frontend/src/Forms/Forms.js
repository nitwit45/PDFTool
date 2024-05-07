import React, { useState, useEffect } from "react";
import { Form, Button, ListGroup, Modal } from "react-bootstrap";
import { Document, Page, pdfjs } from "react-pdf";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import axios from "axios";
import "./form.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BACKEND_ADDRESS } from '../config';  // Import the backend address
import { Input } from 'react-bootstrap'; // Assuming you're using Bootstrap for styling

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
  const [correctAnswer, setCorrectAnswer] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [numCorrectAnswers, setNumCorrectAnswers] = useState(0); // New state variable to track the number of correct answers
  const [showQAContainer, setShowQAContainer] = useState(false);
  const [answer, setAnswer] = useState('');
  const [userInput, setUserInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // Default language
  const [selectedLanguageDropdown, setSelectedLanguageDropdown] = useState('English');

  // Modify the handleLanguageChange function to update selectedLanguageDropdown
  const handleLanguageChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedLanguageDropdown(selectedValue); // Update the selected language in the dropdown
    // You can optionally set selectedLanguage here if needed
    if(selectedValue === "English") {
      setSelectedLanguage("en");
    } else if(selectedValue === "Sinhala") {
      setSelectedLanguage("si");
    } else if(selectedValue === "Tamil") {
      setSelectedLanguage("ta");
    }
};
  

  const handleGenerateAnswer  = async() => {
    try {
      const response = await axios.post(`${BACKEND_ADDRESS}/generateAnswer`, {
        question: userInput,
        input_lan:selectedLanguage
      });

      setAnswer(response.data);
    } 
    catch (error) {
      console.error('Error translating text:', error);
    }
    // Here you can generate the answer based on the userInput
    // For demonstration purposes, I'm just setting a dummy answer
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleHideQuizContainer = () => {
    setShowQuizContainer(false);
  }; 
  const handleHideQAContainer = () => {
    setShowQAContainer(false);
  };

  useEffect(() => {
    if (quizQuestions.length > 0) {
      setCorrectAnswer(quizQuestions[2]);
    }
  }, [quizQuestions]);

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < 10) {
      if (selectedOption === correctAnswer) {
        setNumCorrectAnswers(prevCount => prevCount + 1); // Increment the count of correct answers
        console.log("YayySelected: ", selectedOption, "  Correct: ", correctAnswer)
      } else {
        console.log("NooSelected: ", selectedOption, "  Correct: ", correctAnswer)
      }
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      console.log(currentQuestionIndex)
      const response = await axios.get(`${BACKEND_ADDRESS}/generateQuiz`);
      setQuizQuestions(response.data);
    } else {
      console.log(currentQuestionIndex, "DONEE")
      console.log("Number of correct answers:", numCorrectAnswers);
    }
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const generateQuiz = async () => {
    try {
      setShowQuizContainer(true);
      setCurrentQuestionIndex(0)
      setNumCorrectAnswers(0)
      const response = await axios.get(`${BACKEND_ADDRESS}/generateQuiz`);
      setQuizQuestions(response.data);
      console.log("Meka: ", quizQuestions, correctAnswer)
    } catch (error) {
      console.error("Error generating quiz:", error);
    }
  };  
  
  const generateQA = async () => {
    try {
      setShowQAContainer(true);

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
      toast.success(`"${selectedWord}" Added To Glossary`, {
        position: 'top-right',
      });
      setSelectedWord('');
    }
    else{
      toast.error(`No Word Selected To Add to Glossary!`, {
        position: 'top-right',
      });
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

      await axios.post(`${BACKEND_ADDRESS}/upload`, formData);

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
      const response = await axios.get(`${BACKEND_ADDRESS}/uploads/${file.name}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      setViewFile(blob);
      setPdfUrl(URL.createObjectURL(blob));
      setSelectedFile(file);
      const pdfKey = file ? file.name : null;
      setSelectedNotes(notes[pdfKey] || '');
  
      // Set the currently viewed PDF with file path on the backend
      await axios.post(`${BACKEND_ADDRESS}/setCurrentlyViewedPDF`, { 
        filename: file.name,
        filepath: `${BACKEND_ADDRESS}/uploads/${file.name}`
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
        const response = await axios.get(`${BACKEND_ADDRESS}/getUploadedFiles`);
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
          <div><br /></div>
          <Button className="hidebuttons" variant="secondary" onClick={handleToggleFileList}>
            {showFileList ? "Hide File List" : "Show File List"}
          </Button>
          {showFileList && (
            <>
              <div><br /></div>
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
          <div><br /><br /><br /></div>
          <div className="wholepdfview">
          <div>{pdfUrl && <p>Reading Time: {formatTime(elapsedTime)}</p>}</div>
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
              <div><br /></div>
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
        </div>

        </Col>
      </Row>
    </Container>

    <div className="allbuttons">
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
    <Button variant="primary" onClick={generateQA} className="mx-2">
      Ask Question
    </Button>
  </Col>
</div>


  {showQuizContainer && (
  <Container className="quiz-container">
    {quizQuestions.length > 0 && currentQuestionIndex < 10 ? (
      <div>
        <h3>Quiz Questions</h3>
        <br></br>
        <h5 style={{ fontWeight: 'bold' }}>{quizQuestions[0]}</h5>
        <hr></hr>
        {quizQuestions[1].map((option, index) => (
          <Row key={index} className="mb-2">
            <Col>{option}<hr></hr></Col>
            <Col xs="auto">
              <Form.Check
                type="radio"
                label=""
                name={`question_${quizQuestions[0]}`}
                value={option}
                onChange={handleOptionChange}
                inline
              />
            </Col>
          </Row>
        ))}
      </div>
    ) : (
      <div>
        <h3>Quiz Completed</h3>
        <br />
        <h5>Your Score: {numCorrectAnswers} out of 10</h5>
        <Col xs="auto">
            <Button variant="secondary" onClick={handleHideQuizContainer}>
              Hide Quiz
            </Button>
          </Col>
      </div>
    )}
    {currentQuestionIndex < 10 && (
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
    )}
  </Container>
)}

{showQAContainer && (
        <Container className="quiz-container">
          <Form.Group controlId="languageSelect">
            <Form.Label>Choose a language:</Form.Label>
            <Form.Control className="language-select" as="select" value={selectedLanguageDropdown} onChange={handleLanguageChange}>
              <option value="English">English</option>
              <option value="Sinhala">Sinhala</option>
              <option value="Tamil">Tamil</option>
            </Form.Control>
          </Form.Group>
          <br></br>
          <br></br>
          <Form.Control className="placeholder-color" type="text" value={userInput} onChange={handleInputChange} placeholder="Enter your input" />
          <br />
          {answer && <p>{answer}</p>}
          <br />
          <div className="quiz-controls">
            <Row>
              <Col xs="auto">
                <Button variant="secondary" onClick={handleHideQAContainer}>
                  Hide QA
                </Button>
              </Col>
              <Col className="text-end">
                <Button variant="primary" onClick={handleGenerateAnswer}>
                  Generate Answer
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
    <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
  </div>
);
};

export default Forms;
