import { getAuth } from "firebase/auth";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useContext, useEffect, useState } from "react";
import { Navbar, Nav, Container, Button, Card } from "react-bootstrap";
import { Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthProvider";

export default function Profile() {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  // Uploaded image remains after page refresh
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      const imageRef = ref(storage, `${currentUser.uid}.jpeg`);
      getDownloadURL(imageRef)
        .then((url) => {
          setUrl(url);
        })
        .catch((error) => {
          console.log("No image found or error getting the image URL", error);
        });
    }
  }, [currentUser, navigate]);

  // Logout function
  const handleLogout = () => {
    auth.signOut();
  };

  // Select image file function
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Upload image function
  const handleSubmit = () => {
    const imageRef = ref(storage, `${currentUser.uid}.jpeg`);
    setLoading(true);
    uploadBytes(imageRef, image)
      .then(() => {
        getDownloadURL(imageRef)
          .then((url) => {
            setUrl(url);
          })
          .catch((error) => {
            console.log("Error getting the image URL", error);
          });
        setImage(null);
        setLoading(false);
      })
      .catch((error) => {
        console.log("Error uploading the image", error);
        setLoading(false);
      });
  };

  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark" fixed="top">
        <Container fluid>
          <Navbar.Brand href="/home">Notes</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav className="px-2">
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
        <div className="w-100" style={{ maxWidth: "600px" }}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">User Profile</h2>
              <div
                className="text-center"
                style={{ fontSize: "20px", fontWeight: "bold", color: "blue" }}
              >
                Currently logged in as: {currentUser?.email}
              </div>
              <div className="profile-photo d-flex align-items-center justify-content-center">
                <Avatar src={url} sx={{ width: 150, height: 150, margin: 2 }} />
              </div>
              <div className="d-flex align-items-center justify-content-center">
                <input type="file" onChange={handleImageChange} />
                <Button
                  className="p-2 m-2"
                  variant="dark"
                  disabled={loading || !image}
                  onClick={handleSubmit}
                >
                  Update photo
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
}
