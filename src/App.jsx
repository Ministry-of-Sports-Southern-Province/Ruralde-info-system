import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Develop from "../src/loan/develop";
import RuralOfficer from "../src/loan/ruralofficer";
import ProvincialOfficer from "../src/loan/ProvincialOfficer";
import Student from "../src/student/student";
import Society from "../src/society/society";
import Member from "../src/member/member";
import Contact from "../src/contact/contact";
import Navbar from "../src/navbar/navbar";
import Home from "../src/home/home";
import About from "../src/about/about";
import Register from "./register/register";
import Chairman from "./register/chairman";
import Secretary from "./register/secretary";
import Treasurer from "./register/treasurer";
import Report from "./report/report";
import Startup from "./startup/startup";
import Login from "./login/login"; 
import SignUp from "./login/signup";

function App() {
  return (
    <BrowserRouter>
      {/* Navbar appears on all pages */}
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ruralofficer" element={<RuralOfficer />} />
        <Route path="/provincialofficer" element={<ProvincialOfficer />} />
        <Route path="/student" element={<Student />} />
        <Route path="/society" element={<Society />} />
        <Route path="/member" element={<Member />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/develop" element={<Develop />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chairman" element={<Chairman />} />
        <Route path="/secretary" element={<Secretary />} />
        <Route path="/treasurer" element={<Treasurer />} />
        <Route path="/reports" element={<Report />} />
        <Route path="/startup" element={<Startup />} />
        <Route path="/login" element={<Login />} /> 
     <Route path="/signup" element={<SignUp/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
