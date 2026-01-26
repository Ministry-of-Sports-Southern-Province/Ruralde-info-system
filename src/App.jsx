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
import RuralDevOfficer from "./profile/ruraldevofficer/ruraldevofficer";
import SocietySecretary from "./profile/societyOfficer/societySecretary";
import SocietyTreasure from "./profile/societyOfficer/societyTreasure";
import Subject from "./profile/subject/subject";
import DivisionalSecrtary from "./profile/devsecretary/divisionalsecretary";
import Startup from "./startup/startup";
import Login from "./login/login";
import SignUp from "./login/signup";
import Footer from "./footer/footer";
import Project from "./projects/project";
import SocietyChairman from "./profile/societyOfficer/societyChairman"; // new chairman profile

function App() {
  return (
    <BrowserRouter>
      {/* Navbar appears on all pages */}
      <Navbar />

      <Routes>
        {/* Public / general routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/project" element={<Project />} />

        {/* Applications / forms */}
        <Route path="/develop" element={<Develop />} />
        <Route path="/student" element={<Student />} />
        <Route path="/society" element={<Society />} />
        <Route path="/member" element={<Member />} />

        {/* Auth & startup */}
        <Route path="/register" element={<Register />} />
        <Route path="/chairman" element={<Chairman />} />
        <Route path="/secretary" element={<Secretary />} />
        <Route path="/treasurer" element={<Treasurer />} />
        <Route path="/startup" element={<Startup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Profiles (non-society) */}
        <Route path="/chairmanprofile" element={<Chairmanprofile />} />
        <Route path="/districtOfficer" element={<DistrictOfficer />} />
        <Route path="/provincialofficer" element={<ProvincialOfficer />} />
        <Route path="/ruraldevofficer" element={<RuralDevOfficer />} />
        <Route path="/subject" element={<Subject />} />
        <Route path="/divisionalsecretary" element={<DivisionalSecrtary />} />

        {/* Society profiles */}
        <Route path="/societychairman" element={<SocietyChairman />} />
        <Route path="/societysecretary" element={<SocietySecretary />} />
        <Route path="/societytreasurer" element={<SocietyTreasure />} />

        {/* Optional: footer as full page (if you really need it) */}
        <Route path="/footer" element={<Footer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;