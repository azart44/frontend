import React from 'react';
import '../styles/LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <main>
        <h1>Welcome to Chardora</h1>
        <p>Connecting Rappers and Beatmakers in a Serverless World</p>
        <section className="features">
          <div className="feature">
            <h2>For Rappers</h2>
            <p>Find the perfect beat for your next hit.</p>
          </div>
          <div className="feature">
            <h2>For Beatmakers</h2>
            <p>Showcase your beats to talented artists.</p>
          </div>
        </section>
        <section className="tech-stack">
          <h2>Our Technology</h2>
          <p>Built with AWS Serverless and Microservices Architecture</p>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;