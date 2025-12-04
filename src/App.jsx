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
import Chairmanprofile from "./profile/chairman/chairmanprofile";
import DistrictOfficer from "./profile/districtOfficer/districtOfficer";
import SocietyOfficer from "./profile/societyofficer/societyofficer";
import Subject from "./profile/subject/subject";
import Startup from "./startup/startup";
import Login from "./login/login";
import SignUp from "./login/signup";
import Footer from "./footer/footer";

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
        <Route path="/startup" element={<Startup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />}></Route>
        <Route path="/footer" element={<Footer />}></Route>
        <Route path="/chairmanprofile" element={<Chairmanprofile />}></Route>
        <Route path="/districtOfficer" element={<DistrictOfficer />}></Route>
        <Route path="/societyOfficer" element={<SocietyOfficer />}></Route>
        <Route path="/subject" element={<Subject />}></Route>

        <Route path="/"></Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
