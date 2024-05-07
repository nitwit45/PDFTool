import React, { useState } from "react";
import "./login.css";
import Img from "../assets/logo.png";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import { BACKEND_ADDRESS } from '../config';  // Import the backend address

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleSignIn = async () => {
    try {
      const response = await fetch(`${BACKEND_ADDRESS}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (response.ok) {
        // Redirect to dashboard after successful login
        window.location.href = "/dashboard";
      } else {
        const data = await response.json();
        setAlertMessage(data.error);
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setAlertMessage("An error occurred. Please try again later.");
      setShowAlert(true);
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  return (
    <div className="login-container">
      <div className="heading">
        <h1>Welcome back</h1>
      </div>
      <div className="logo">
        <img src={Img} alt="logo" />
      <div className="centered-form">
        <div className="form-container">
          <FloatingLabel controlId="floatingInput" label="📧 Username" className="mb-3">
            <Form.Control
              type="email"
              placeholder="name@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FloatingLabel>
          <FloatingLabel controlId="floatingPassword" label="🔑 Password">
            <Form.Control
              size="sm"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FloatingLabel>
          <div className="button-container">
            <h3>Sign In</h3>
            <Button
              variant="outline-light"
              style={{ borderRadius: "50px" }}
              className="button"
              onClick={handleSignIn}
            >
              →
            </Button>
          </div>
        </div>
        <div className="signup">
          <Link to="/signup">
            <h6>Sign Up</h6>
          </Link>
          <h6>Forgot Password</h6>
        </div>
      </div>
      </div>

      {/* Alert Modal */}
      <Modal show={showAlert} onHide={handleCloseAlert} centered>
        <Modal.Header closeButton>
          <Modal.Title>Alert</Modal.Title>
        </Modal.Header>
        <Modal.Body>{alertMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseAlert}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Login;
