import "../App.css";
import { Container, Navbar, Nav, Button } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthProvider";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState(null);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  const auth = getAuth();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  // Fetch notes function
  const fetchNotes = async (token) => {
    try {
      const response = await axios.get(
        `https://99b6929c-56a5-444e-96dd-f7076230e811-00-1fjk0a40maqdf.sisko.replit.dev/notes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(response.data); // Store the fetched notes
    } catch (error) {
      console.error("Error fetching notes: ", error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (currentUser) {
        try {
          // Fetch Firebase ID token
          const token = await auth.currentUser.getIdToken(true);
          setIdToken(token); // Store the token

          // Fetch the notes using the token
          await fetchNotes(token);

          setLoading(false); // Set Loading to false after notes are fetched
        } catch (error) {
          console.error("Error during initialization: ", error);
          navigate("/login"); // Redirect if there's an issue
        }
      } else {
        navigate("/login"); // Redirect if not logged in
      }
    };

    initialize();
  }, [currentUser, navigate, auth]);

  // If user selects a note, display in input boxes
  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  // Add note function
  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      if (!currentUser || !idToken) {
        console.error("No user is logged in or token is missing.");
        return;
      }

      const response = await axios.post(
        `https://99b6929c-56a5-444e-96dd-f7076230e811-00-1fjk0a40maqdf.sisko.replit.dev/notes`,
        { title, content, user_id: currentUser.uid },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      const newNote = response.data;
      setNotes([newNote, ...notes]);
      setTitle("");
      setContent("");
    } catch (error) {
      if (error.response) {
        console.error("Server responded with an error:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
    }
  };

  // Update note function
  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!selectedNote) return;

    try {
      const response = await axios.put(
        `https://99b6929c-56a5-444e-96dd-f7076230e811-00-1fjk0a40maqdf.sisko.replit.dev/notes/${selectedNote.id}`,
        { title, content, user_id: currentUser.uid },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      const updatedNote = await response.data;
      const updatedNotesList = notes.map((note) =>
        note.id === selectedNote.id ? updatedNote : note
      );

      setNotes(updatedNotesList);
      setTitle("");
      setContent("");
      setSelectedNote(null);
    } catch (error) {
      console.error("Error updating note: ", error);
    }
  };

  // Cancel editing note
  const handleCancel = () => {
    setTitle("");
    setContent("");
    setSelectedNote(null);
  };

  // Delete note function
  const deleteNote = async (e, noteId) => {
    e.stopPropagation();
    setDeletingNoteId(noteId);
    try {
      await axios.delete(
        `https://99b6929c-56a5-444e-96dd-f7076230e811-00-1fjk0a40maqdf.sisko.replit.dev/notes/${noteId}`,
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      const updatedNotes = notes.filter((note) => note.id !== noteId);
      setNotes(updatedNotes);
    } catch (error) {
      console.error("Error deleting note: ", error);
    } finally {
      setDeletingNoteId(null); // Reset deleting state
    }
  };

  // Handle loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // User logout function
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark" fixed="top">
        <Container fluid>
          <Navbar.Brand href="/home">Notes</Navbar.Brand>
          <Navbar.Toggle />
          <Nav className="me-auto">
            <Nav.Link href="/wordsearch">Word Finder</Nav.Link>
          </Nav>
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

      <div className="app-container">
        <form
          className="note-form"
          onSubmit={(e) => {
            e.preventDefault();
            selectedNote ? handleUpdateNote(e) : handleAddNote(e);
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
          ></input>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            rows={10}
            required
          ></textarea>

          {selectedNote ? (
            <div className="edit-buttons">
              <button type="submit">Save</button>
              <button onClick={handleCancel}>Cancel</button>
            </div>
          ) : (
            <button type="submit">Add Note</button>
          )}
        </form>
        <div className="notes-grid">
          {notes.map((note) => (
            <div
              className="note-item"
              key={note.id}
              onClick={() => handleNoteClick(note)}
            >
              <div className="notes-header">
                <button
                  onClick={(e) => deleteNote(e, note.id)}
                  disabled={deletingNoteId === note.id}
                >
                  x
                </button>
              </div>
              <h2>{note.title}</h2>
              <p>{note.content}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
