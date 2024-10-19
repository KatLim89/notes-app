import { getAuth } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { Navbar, Nav, Container, Button, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthProvider";
import axios from "axios";

export default function WordSearch() {
  const [word, setWord] = useState("");
  const [relatedWords, setRelatedWords] = useState([]);

  const handleInputChange = (e) => {
    setWord(e.target.value);
  };

  const searchRelatedWords = async () => {
    if (word) {
      const result = await axios.get(
        `https://api.datamuse.com/words?ml=${word}`
      );
      setRelatedWords(result.data);
    }
  };

  const clearSearh = () => {
    setWord("");
    setRelatedWords([]);
  };

  const auth = getAuth();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark" fixed="top">
        <Container fluid>
          <Navbar.Brand href="/home">Notes</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav className="px-2">
              <Link to={"/profile"}>
                <i
                  className="me-3 bi bi-person-circle"
                  style={{ color: "white", fontSize: "24px" }}
                />
              </Link>
              <Button variant="danger" onClick={handleLogout}>
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container
        className="d-flex align-items-top justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="w-100" style={{ maxWidth: "500px" }}>
          <Card>
            <Card.Body>
              <h2 className="text-center">Word Finder</h2>
              <Card.Title className="text-center">
                <i className="bi bi-book m-2" />
                Referenced using Datamuse API
              </Card.Title>
              <Card.Subtitle className="mb-2">
                Word-finding query engine with{" "}
                <b>
                  <u>means like</u>
                </b>{" "}
                constraint: results have meaning related to word input
              </Card.Subtitle>
              <div className="m-2 p-2">
                <input
                  type="text"
                  value={word}
                  onChange={handleInputChange}
                  placeholder="Enter a word"
                  className="w-50"
                />
                <Button className="m-2" onClick={searchRelatedWords}>
                  Search
                </Button>
                <Button variant="dark" onClick={clearSearh}>
                  Clear
                </Button>

                <div>
                  {relatedWords.length > 0 ? (
                    <ul>
                      {relatedWords.map((w, index) => (
                        <li key={index}>{w.word}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No related words found.</p>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
}
