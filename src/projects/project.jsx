import React from "react";
import "./project.css";

// Import images from assets (rename paths/names to match your files)
import proj1 from "../assets/dp 03.jpg";
import proj2 from "../assets/dp04.jpg";
import proj3 from "../assets/dp 05.jpg";

const projectsData = [
  {
    id: 1,
    title: "ගැමි සේනාංකන වැඩසටහන",
    district: "Galle",
    description:
      "වෘත්තීය පුහුණුව, කෘෂිකාර්මික සහ අත්පණි හැකියාවන් සංවර්ධනය කිරීම සඳහා ගම්මාන මට්ටමේ සන්ධාන සහිත වැඩසටහන්.",
    image: proj1,
  },
  {
    id: 2,
    title: "ආර්ථික බලවර්ධන ව්‍යාපෘතිය",
    district: "Matara",
    description:
      "ලഘු සහ මධ්‍ය පරිමාණ ව්‍යාපාර සඳහා ණය පහසුකම් අරඹා ගම්සමූහ ආර්ථිකය ශක්තිමත් කිරීම.",
    image: proj2,
  },
  {
    id: 3,
    title: "ආධාර සහ ආරක්ෂක ජාල වැඩසටහන්",
    district: "Hambantota",
    description:
      "අඩු ආදායම්ලාභී පවුල් සඳහා අධ්‍යාපන සහ සමාජ ආරක්ෂණ වැඩසටහන් ක්‍රියාත්මක කිරීම.",
    image: proj3,
  },
];

const Project = () => {
  return (
    <section className="projects-section">
      <div className="projects-container">
        <h2 className="projects-title">
          Rural Development Projects
          <span className="projects-subtitle">
            / ග්‍රාම සංවර්ධන ව්‍යාපෘති
          </span>
        </h2>

        <p className="projects-intro">
          This section highlights key development initiatives coordinated through
          the Grama Samurdhi system in the Southern Province. Each project
          supports sustainable rural development and community well‑being.
        </p>

        <div className="projects-grid">
          {projectsData.map((project) => (
            <div className="project-card" key={project.id}>
              <div className="project-image-wrapper">
                <img
                  src={project.image}
                  alt={project.title}
                  className="project-image"
                />
              </div>
              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-meta">
                  District: <span>{project.district}</span>
                </p>
                <p className="project-description">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Project;