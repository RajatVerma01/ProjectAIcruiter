import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./Home.css";

function Home() {


  return (
    <>
      <div className="container">
        <div className="heading-container">
          <h2>AI<span>cruiter</span></h2>
          <h1>Join us for a <span>revolutionary change</span> in your interview preparation.</h1>
        </div>
        <div className="card-container">
          <div className="card">
            <div className="top-container">
              <h1>We are your personalized interview coach !!</h1>
            </div>
            <div className="mid-container">
              <div className="left-container">
                <div>
                  <div className="heading"><h2>Hey, I am</h2></div>
                  <div className="website-name"><h1>AIcruiter</h1></div>
                  <div className="tagline"><h3>I will make sure that you prepare well !</h3></div>
                  <div className="left-btn-container">
                    <button className="btn1">
                      Start your preparation
                    </button>
                    <button className="btn2">Explore our website</button>
                  </div>
                </div>
              </div>
              <div className="right-container">
                <img src="/Untitled design (4).png" alt="AIcruiter" />
              </div>
            </div>
            <div className="bottom-container">
              <div className="bottom-search-container">
                <div className="text">
                  Find out interviews, search now for your required one
                </div>
                <div className="button">
                  <div className="button-text">Search Now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
