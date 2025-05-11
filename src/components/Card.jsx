import "./Card.css";

function Card({ title, description, imgSrc }) {
  return (
    <div className="About-card">
      <div className="card-image">
        <img src={imgSrc} alt={title} />
      </div>
      <div className="card-content">
        <h2 className="card-title">{title}</h2>
        <p className="card-text">{description}</p>
        <button className="card-button">Start your preparation</button>
      </div>
    </div>
  );
}

export default Card;
