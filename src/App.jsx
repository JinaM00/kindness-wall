// src/App.jsx
// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Features from "./pages/Features";
import Wall from "./pages/Wall";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(null);

  // ✅ Load user from localStorage when app starts
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleLogin = (email) => {
    setUser(email);
    localStorage.setItem("user", email); // ✅ save to localStorage
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user"); // ✅ clear from localStorage
  };

  return (
    <Router>
      <div className="App">
        <NavBar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/wall" element={<Wall />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
// import React, { useState } from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import NavBar from "./components/NavBar";
// import Footer from "./components/Footer";
// import Home from "./pages/Home";
// import About from "./pages/About";
// import Features from "./pages/Features";
// import Wall from "./pages/Wall";
// import Login from "./pages/Login";

// function App() {
//   const [user, setUser] = useState(null);

//   const handleLogin = (email) => setUser(email);   // ✅ store email when logged in
//   const handleLogout = () => setUser(null);        // ✅ clear user when logged out

//   return (
//     <Router>
//       <div className="App">
//         <NavBar user={user} onLogout={handleLogout} />
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/about" element={<About />} />
//           <Route path="/features" element={<Features />} />
//           <Route path="/wall" element={<Wall />} />
//           <Route path="/login" element={<Login onLogin={handleLogin} />} />
//         </Routes>
//         <Footer />
//       </div>
//     </Router>
//   );
// }

// export default App;
