import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LISTING_TYPES, ROUTES } from '../data/constants';
import { PET_TYPES } from '../data/constantsJsx';
import '../styles/Home.css';

const Home: React.FC = () => {
  const [randomPetImage, setRandomPetImage] = useState<string>('/images/generic/doggo.jpg');
  useEffect(() => {
    // List of pet images available in the public/images/pets directory
    const petImages = [
      'bunny.jpg', 'cat1.jpg', 'cat2.jpg', 'cat3.jpg', 'dog-9.jpg',
      'dog1.png', 'dog3.jpg', 'dog4.png', 'dog5.jpg',
      'dog6.png', 'dog7.jpg', 'dog8.jpg', 'dog10.jpg', 'hedgehog.jpg'
    ];

    // Create a more robust random selection using a combination of current time
    // and crypto random values (if available)
    let randomIndex;
    if (window.crypto && window.crypto.getRandomValues) {
      // Use cryptographically strong random number generator when available
      const randomBuffer = new Uint32Array(1);
      window.crypto.getRandomValues(randomBuffer);
      randomIndex = randomBuffer[0] % petImages.length;
    } else {
      // Fallback to Math.random() with time-based seed influence
      const timeInfluence = Date.now() % petImages.length;
      randomIndex = Math.floor(Math.random() * petImages.length);
      // Combine the two sources of randomness
      randomIndex = (randomIndex + timeInfluence) % petImages.length;
    }

    // Select a random image from the array using the generated index
    const randomImage = petImages[randomIndex];
    setRandomPetImage(`/images/pets/${randomImage}`);
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-wrapper">
          <div className="hero-content">
            <h1>Find places where your pets are welcome</h1>
            <p>Discover and share pet-friendly venues. Browse by pet type, location, or venue category.</p>
            <div className="hero-buttons">
              <Link to={ROUTES.LISTINGS} className="btn btn-outline">Browse listings</Link>
            </div>
          </div>
          <div className="hero-images">
            <div className="hero-image hero-image-back">
              <img src={`${process.env.PUBLIC_URL}/images/venues/_park.jpg`} alt="Pet-friendly park" />
            </div>
            <div className="hero-image hero-image-front">
              <img src={`${process.env.PUBLIC_URL}/images/venues/_custom.jpg`} alt="Pet-friendly venue" />
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <section className="pet-types">
          <div className="pet-types-wrapper">
            <div className="pet-types-content">
              <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
                <h2>Find places for your pets</h2>
                <p>Browse venues by the type of companion you're bringing along.</p>
              </div>
              <div className="pet-types-grid">
                {PET_TYPES.map(pet => (
                  <Link
                    to={`${ROUTES.LISTINGS}?petType=${pet.id}`}
                    key={pet.id}
                    className="pet-type-card"
                  >
                    <span className="pet-icon">{pet.icon}</span>
                    <h3>{pet.name}</h3>
                  </Link>
                ))}
              </div>
            </div>
            <div className="pet-types-illustration">
              <div className="pet-emoji-group">
                <span>🐶</span>
                <span>🐱</span>
                <span>🐰</span>
                <span>🐦</span>
                <span>🐢</span>
                <span>🐹</span>
              </div>
            </div>
          </div>
        </section>
        <section className="why-section">
          <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
            <h2>Why choose Octopets?</h2>
            <p>Purpose-built discovery for real outings with animals — not generic POI lists.</p>
          </div>
          <div className="why-wrapper">
            <div className="why-content">
              <div className="why-grid">
                <div className="why-card">
                  <span className="why-icon">🔎</span>
                  <h3>Discover</h3>
                  <p>Curated listings filtered by the pets actually visiting them.</p>
                </div>
                <div className="why-card">
                  <span className="why-icon">🤝</span>
                  <h3>Connect</h3>
                  <p>Lightweight sharing of what worked and what to prepare for.</p>
                </div>
                <div className="why-card">
                  <span className="why-icon">⭐</span>
                  <h3>Rate & Review</h3>
                  <p>Structured feedback that helps the next owner make a faster decision.</p>
                </div>
                <div className="why-card">
                  <span className="why-icon">💡</span>
                  <h3>Get Context</h3>
                  <p>Surface type, shade, water access, ambient noise and staff attitude details.</p>
                </div>
                <div className="why-card">
                  <span className="why-icon">📍</span>
                  <h3>Arrival Notes</h3>
                  <p>Practical tips on parking, entrance access, and what to expect on arrival.</p>
                </div>
                <div className="why-card">
                  <span className="why-icon">🛡️</span>
                  <h3>Safety First</h3>
                  <p>Comfort and safety indicators including noise levels and environment details.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="venue-types">
          <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
            <h2>Explore venue types</h2>
            <p>Discover a variety of pet-friendly establishments for every occasion</p>
          </div>

          <div className="venue-types-wrapper">
            <div className="venue-types-grid">
              {LISTING_TYPES.map(type => (
                <Link
                  to={`${ROUTES.LISTINGS}?listingType=${type.id}`}
                  key={type.id}
                  className="venue-card"
                >
                  <div className="venue-card-content">
                    <h3>{type.name}</h3>
                    <p>{type.description}</p>
                  </div>
                  <div className="venue-image-container">
                    <img
                      src={`${process.env.PUBLIC_URL}/images/venues/_${type.id}.jpg`}
                      alt={type.name}
                      className="venue-image"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>        <section className="cta-section-container">
          <section className="cta-section">
            <div className="cta-image">
              <img src={`${process.env.PUBLIC_URL}${randomPetImage}`} alt="Pet enjoying a pet-friendly place" />
            </div>
            <div className="cta-content">
              <div className="cta-text">
                <h2>Have a pet-friendly place to share?</h2>
                <p>Help other pet owners discover great places for their furry, feathery, or scaly friends.</p>
              </div>
            </div>          </section>
        </section>
      </section>
    </div>
  );
};

export default Home;