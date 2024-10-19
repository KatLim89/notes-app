import { Container, Card, Form, Button, Modal } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import axios from "axios";

export default function Auth() {
  const [modalShow, setModalShow] = useState(null);
  const handleShowSignUp = () => setModalShow("SignUp");
  const handleShowLogin = () => setModalShow("Login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const auth = getAuth();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) navigate("/home");
  }, [currentUser, navigate]);

  // Sign up function
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Email and password are required");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();
      await axios.post(
        `https://99b6929c-56a5-444e-96dd-f7076230e811-00-1fjk0a40maqdf.sisko.replit.dev/signup`,
        { token: idToken }
      );

      console.log("User signed up and stored in database successfully");
    } catch (error) {
      console.error("Error during signup: ", error);
    }
  };

  // Log in function
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Email and password are required");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();
      await axios.post(
        `https://99b6929c-56a5-444e-96dd-f7076230e811-00-1fjk0a40maqdf.sisko.replit.dev/login`,
        { token: idToken }
      );

      console.log("User logged in successfully");
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  // Close modal
  const handleClose = () => {
    setModalShow(null);
    setEmail("");
    setPassword("");
  };

  return (
    <>
      <Container
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <Card border="dark">
            <Card.Body>
              <h2 className="text-center mb-4">Welcome to Notes!</h2>
              <Button className="w-100" onClick={handleShowLogin}>
                Log in
              </Button>
            </Card.Body>
            <hr />
            <Card.Body>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                Don&apos;t have an account?
              </p>
              <Button
                className="w-100"
                variant="outline-danger"
                onClick={handleShowSignUp}
              >
                Create an account
              </Button>
              <p style={{ fontSize: "12px" }}>
                By signing up, you agree to the Terms of Service and Privacy
                Policy, including Cookie Use
              </p>
            </Card.Body>
          </Card>
        </div>
      </Container>
      <Modal
        show={modalShow !== null}
        onHide={handleClose}
        animation={false}
        centered
      >
        <Modal.Body>
          <h2 className="text-center mb-4" style={{ fontWeight: "bold" }}>
            {modalShow === "SignUp"
              ? "Create your account"
              : "Log in to your account"}
          </h2>
          <Form
            className="d-grid gap-2 px-5"
            onSubmit={modalShow === "SignUp" ? handleSignUp : handleLogin}
          >
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter email"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter password"
              />
            </Form.Group>

            <Button className="rounded-pill" type="submit">
              {modalShow === "SignUp" ? "Sign up" : "Log in"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
