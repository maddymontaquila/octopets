import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LISTING_TYPES, ROUTES } from '../data/constants';
import { PET_TYPES } from '../data/constantsJsx';
import RadarSection from '../components/RadarSection';
import PetPolaroid from '../components/PetPolaroid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDog, 
  faCat, 
  faDove, 
  faFish, 
  faOtter, 
  faHorse, 
  faPaw,
  faListCheck,
  faComments,
  faLocationDot,
  faShieldHalved
} from '@fortawesome/free-solid-svg-icons';
import '../styles/Home.css';

const testimonials = [
  {
    text: "Finding pet-friendly places used to be a guessing game. Octopets made it effortless to discover venues where my dog is truly welcome, with real reviews from other pet owners.",
    author: "Sarah, Seattle"
  },
  {
    text: "Octopets transformed how we explore the city with our cats. No more awkward calls or showing up to discover pets aren't actually welcome. Every listing is accurate and helpful.",
    author: "Michael, Portland"
  },
  {
    text: "As a rabbit owner, finding suitable venues was nearly impossible. Octopets connected me with a community of exotic pet owners and places that genuinely accommodate all animals.",
    author: "Jessica, Austin"
  },
  {
    text: "The detailed information about noise levels, surface types, and pet amenities helps me plan perfect outings for my anxious rescue dog. Octopets gets the details that matter.",
    author: "David, San Francisco"
  }
];

interface PetInfo {
  image: string;
  name: string;
  type: string;
  description: string;
  funFact?: string;
}

const heroPets: { [key: string]: PetInfo } = {
  park: {
    image: '/images/venues/_park.jpg',
    name: 'Milli',
    type: 'Australian Cattle Dog',
    description: 'Milli is an energetic and intelligent Australian Cattle Dog who loves exploring new pet-friendly venues. She\'s always ready for an adventure and makes friends wherever she goes.',
    funFact: 'Milli is incredibly athletic and can jump over 4 feet high!'
  },
  bunny: {
    image: '/images/pets/bunny.jpg',
    name: 'Milk',
    type: 'Broken Lionhead Rabbit',
    description: 'A gruff bunny with a misanthropic streak, Milk is a bunnicula who tolerates pet-friendly venues on his own terms. He\'s not here to make friends.',
    funFact: 'Milk prefers dark corners and has been spotted giving judgmental side-eye to overly cheerful dogs.'
  },
  venue: {
    image: '/images/venues/_custom.jpg',
    name: 'Chloe',
    type: 'Miniature Schnauzer',
    description: 'Chloe is a spirited and intelligent miniature schnauzer who loves discovering new pet-friendly spots. She\'s always curious and ready to explore with her favorite humans.',
    funFact: 'Chloe has a distinctive beard and loves to pose for photos!'
  }
};

const Home: React.FC = () => {
  const [randomPetImage, setRandomPetImage] = useState<string>('/images/generic/doggo.jpg');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [selectedPet, setSelectedPet] = useState<PetInfo | null>(null);
  const [sparkles, setSparkles] = useState<Array<{ 
    id: number; 
    x: number; 
    y: number; 
    size: number; 
    distance: number; 
    angle: number; 
    rotation: number; 
    duration: number;
  }>>([]);

  // Helper function to get pet icon
  const getPetIcon = (petId: string) => {
    const iconMap: { [key: string]: any } = {
      'dogs': faDog,
      'cats': faCat,
      'birds': faDove,
      'fish': faFish,
      'rabbits': faOtter,
      'horses': faHorse,
      'other': faPaw
    };
    return iconMap[petId] || faPaw;
  };

  // Easter egg: sparkle effect when clicking emoji
  const handleEmojiClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create 24 sparkles in a circular pattern with randomization
    const newSparkles = Array.from({ length: 24 }, (_, i) => ({
      id: Date.now() + i,
      x: centerX,
      y: centerY,
      size: Math.random() * 1.5 + 0.5, // Random size between 0.5 and 2
      distance: Math.random() * 100 + 100, // Random distance between 100px and 200px
      angle: (i * 15) + (Math.random() * 10 - 5), // Base angle with ±5deg randomness
      rotation: Math.random() * 720, // Random rotation between 0 and 720 degrees
      duration: Math.random() * 0.4 + 0.8, // Random duration between 0.8s and 1.2s
    }));

    setSparkles(prev => [...prev, ...newSparkles]);

    // Remove sparkles after animation completes (use max duration)
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.some(ns => ns.id === s.id)));
    }, 1200);
  };
  
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

  // Cycle testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
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
            <div 
              className="hero-image hero-image-back hero-image-clickable"
              onClick={() => setSelectedPet(heroPets.park)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && setSelectedPet(heroPets.park)}
            >
              <div className="hero-card">
                <img src={`${process.env.PUBLIC_URL}/images/venues/_park.jpg`} alt="Pet-friendly park" />
              </div>
            </div>
            <div 
              className="hero-image hero-image-middle hero-image-clickable"
              onClick={() => setSelectedPet(heroPets.bunny)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && setSelectedPet(heroPets.bunny)}
            >
              <div className="hero-card">
                <img src={`${process.env.PUBLIC_URL}/images/pets/bunny.jpg`} alt="Cute bunny" />
              </div>
            </div>
            <div 
              className="hero-image hero-image-front hero-image-clickable"
              onClick={() => setSelectedPet(heroPets.venue)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && setSelectedPet(heroPets.venue)}
            >
              <div className="hero-card">
                <img src={`${process.env.PUBLIC_URL}/images/venues/_custom.jpg`} alt="Pet-friendly venue" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedPet && (
        <PetPolaroid
          image={`${process.env.PUBLIC_URL}${selectedPet.image}`}
          name={selectedPet.name}
          type={selectedPet.type}
          description={selectedPet.description}
          funFact={selectedPet.funFact}
          onClose={() => setSelectedPet(null)}
        />
      )}

      <section className="partners-section">
        <div className="partners-container">
          <div className="partners-label">Supported by</div>
          <div className="partners-scroll-wrapper">
            <div className="partners-scroll">
              <div className="partners-track">
                <div className="partner-logo">Green Paws Park</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Happy Tails Shelter</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Adopt-a-Friend</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Riverside Dog Park</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Pet Haven Rescue</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Furry Friends Adoption</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Meadow Park</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Pawsitive Shelter</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Whiskers & Wags</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Oakwood Pet Park</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Second Chance Pets</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Bark & Play Park</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Safe Haven Shelter</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Forever Home Adoption</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Sunset Dog Park</div>
                <div className="partner-separator">·</div>
                {/* Duplicate for seamless scroll */}
                <div className="partner-logo">Green Paws Park</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Happy Tails Shelter</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Adopt-a-Friend</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Riverside Dog Park</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Pet Haven Rescue</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Furry Friends Adoption</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Meadow Park</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Pawsitive Shelter</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Whiskers & Wags</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Oakwood Pet Park</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Second Chance Pets</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Bark & Play Park</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Safe Haven Shelter</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Forever Home Adoption</div>
                <div className="partner-separator">·</div>
                <div className="partner-logo">Sunset Dog Park</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="pet-emoji-peek">
        <div className="pet-emoji-group">
          <span onClick={handleEmojiClick}>🐶</span>
          <span onClick={handleEmojiClick}>🐱</span>
          <span onClick={handleEmojiClick}>🐰</span>
          <span onClick={handleEmojiClick}>🐦</span>
          <span onClick={handleEmojiClick}>🐢</span>
          <span onClick={handleEmojiClick}>🐹</span>
        </div>
      </div>

      {/* Sparkles container */}
      <div className="sparkles-container">
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="sparkle"
            style={{
              left: sparkle.x,
              top: sparkle.y,
              fontSize: `${sparkle.size * 24}px`,
              '--angle': `${sparkle.angle}deg`,
              '--distance': `${sparkle.distance}px`,
              '--rotation': `${sparkle.rotation}deg`,
              '--duration': `${sparkle.duration}s`,
            } as React.CSSProperties}
          >
            ✨
          </div>
        ))}
      </div>

      <section className="content">
        <section className="pet-types">
          <div className="pet-types-wrapper">
            <div className="pet-types-content">
              <div className="section-header">
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
                    <span className="pet-icon">
                      <FontAwesomeIcon icon={getPetIcon(pet.id)} />
                    </span>
                    <h3>{pet.name}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
        <RadarSection />
        <section className="why-section">
          <div className="why-wrapper">
            <div className="why-images">
              <div className="why-image-main">
                <img src={`${process.env.PUBLIC_URL}/images/pets/dog3.jpg`} alt="Happy dog" />
              </div>
              <div className="why-image-overlay">
                <div className="benefits-card">
                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <FontAwesomeIcon icon={faListCheck} />
                    </div>
                    <div className="benefit-text">
                      <h4>Curated Listings</h4>
                      <p>Filtered by pets</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <FontAwesomeIcon icon={faComments} />
                    </div>
                    <div className="benefit-text">
                      <h4>Real Reviews</h4>
                      <p>From pet owners</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <FontAwesomeIcon icon={faLocationDot} />
                    </div>
                    <div className="benefit-text">
                      <h4>Detailed Context</h4>
                      <p>Surface, noise, access</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <FontAwesomeIcon icon={faShieldHalved} />
                    </div>
                    <div className="benefit-text">
                      <h4>Safety First</h4>
                      <p>Environment details</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="why-content">
              <h2>Why choose Octopets?</h2>
              <p className="why-description">
                Purpose-built discovery for real outings with animals — not generic POI lists. 
                We help you find the perfect places where your pets are truly welcome and safe.
              </p>
              <Link to={ROUTES.LISTINGS} className="btn btn-primary">
                Explore listings
              </Link>
            </div>
          </div>
        </section>

        <section className="testimonials-section">
          <div className="testimonials-content">
            <div className="quote-mark">&ldquo;</div>
            <div className="testimonial-quote">
              <p className="quote-text">{testimonials[currentTestimonial].text}</p>
              <p className="quote-author">{testimonials[currentTestimonial].author}</p>
            </div>
            <div className="testimonial-navigation">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`nav-dot ${index === currentTestimonial ? 'active' : ''}`}
                  onClick={() => setCurrentTestimonial(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
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
                    <h3>
                      {type.name}
                      {(type.id === 'park' || type.id === 'cafe') && <span className="new-badge">New</span>}
                    </h3>
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
                <div className="cta-buttons">
                  <Link to={ROUTES.LISTINGS} className="btn btn-secondary">
                    Add a listing
                  </Link>
                </div>
              </div>
            </div>          </section>
        </section>
      </section>
    </div>
  );
};

export default Home;