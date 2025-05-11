import "./About.css";
import Card from "../components/Card";

function About() {
  const cards = [
    {
      title: "HR Interview",
      description: "Prepare for your HR round here, we will guide you to clear any HR interview.",
      imgSrc: "/Your paragraph text.png",
    },
    {
      title: "Technical Interview",
      description: "Master data structures, algorithms, and core concepts to crack the technical round.",
      imgSrc: "/Your paragraph text (1).png",
    },
    {
      title: "Mock Interview",
      description: "Simulate real interviews with AI-powered practice and get detailed feedback.",
      imgSrc: "/Your paragraph text (2).png",
    },
  ];

  return (
    <div className="about-page">
      {cards.map((card, index) => (
        <Card
          key={index}
          title={card.title}
          description={card.description}
          imgSrc={card.imgSrc}
        />
      ))}
    </div>
  );
}

export default About;
