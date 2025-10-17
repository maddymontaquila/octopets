import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWifi, 
  faSquareParking, 
  faUtensils, 
  faWater, 
  faTree,
  faShower,
  faUmbrellaBeach,
  faDog,
  faMugSaucer,
  faCouch,
  faTv,
  faSnowflake,
  faFire,
  faShieldDog,
  faCheck,
  faTrash,
  faChair,
  faSeedling,
  faPersonWalking,
  faPaw,
  faHouseChimney,
  faBowlFood,
  faBed,
  faKey,
  faWind,
  faBroom,
  faCar,
  faKitchenSet,
  faPhone,
  faEnvelope,
  faGlobe,
  faLocationDot,
  faStar,
  faCat,
  faHorse,
  faDove,
  faFish,
  faOtter,
  faHouse,
  faHotel,
  faCartShopping,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';
import { LISTING_TYPES, ROUTES } from '../data/constants';
import { PET_TYPES } from '../data/constantsJsx';
import { DataService } from '../data/dataService';
import { Listing, ListingType } from '../types/types';
import '../styles/ListingDetails.css';

// Map amenities to FontAwesome icons
const getAmenityIcon = (amenity: string) => {
  const amenityLower = amenity.toLowerCase();
  
  // Connectivity & Tech
  if (amenityLower.includes('wifi') || amenityLower.includes('wi-fi') || amenityLower.includes('internet')) return faWifi;
  if (amenityLower.includes('tv') || amenityLower.includes('entertainment')) return faTv;
  
  // Parking & Transportation
  if (amenityLower.includes('parking')) return faSquareParking;
  if (amenityLower.includes('car') || amenityLower.includes('vehicle')) return faCar;
  
  // Food & Dining
  if (amenityLower.includes('food') || amenityLower.includes('dining') || amenityLower.includes('restaurant')) return faUtensils;
  if (amenityLower.includes('kitchen')) return faKitchenSet;
  if (amenityLower.includes('coffee') || amenityLower.includes('cafe')) return faMugSaucer;
  if (amenityLower.includes('bowl') || amenityLower.includes('feeding')) return faBowlFood;
  
  // Water & Outdoor
  if (amenityLower.includes('water') || amenityLower.includes('fountain')) return faWater;
  if (amenityLower.includes('beach') || amenityLower.includes('pool')) return faUmbrellaBeach;
  if (amenityLower.includes('outdoor') || amenityLower.includes('yard')) return faTree;
  if (amenityLower.includes('garden') || amenityLower.includes('plant')) return faSeedling;
  
  // Comfort & Furniture
  if (amenityLower.includes('seating') || amenityLower.includes('lounge') || amenityLower.includes('chair')) return faChair;
  if (amenityLower.includes('couch') || amenityLower.includes('sofa')) return faCouch;
  if (amenityLower.includes('bench')) return faChair;
  if (amenityLower.includes('bed') || amenityLower.includes('sleep')) return faBed;
  if (amenityLower.includes('shade') || amenityLower.includes('shelter')) return faTree;
  
  // Climate Control
  if (amenityLower.includes('air') || amenityLower.includes('ac') || amenityLower.includes('cooling') || amenityLower.includes('climate')) return faSnowflake;
  if (amenityLower.includes('heat') || amenityLower.includes('fireplace') || amenityLower.includes('warm')) return faFire;
  if (amenityLower.includes('ventilat')) return faWind;
  
  // Bathroom & Cleaning
  if (amenityLower.includes('shower') || amenityLower.includes('bath')) return faShower;
  if (amenityLower.includes('waste') || amenityLower.includes('trash') || amenityLower.includes('disposal')) return faTrash;
  if (amenityLower.includes('clean') || amenityLower.includes('housekeep')) return faBroom;
  
  // Pet Specific
  if (amenityLower.includes('pet') || amenityLower.includes('dog') || amenityLower.includes('cat')) return faDog;
  if (amenityLower.includes('fenced') || amenityLower.includes('secure') || amenityLower.includes('enclosed')) return faShieldDog;
  if (amenityLower.includes('paw') || amenityLower.includes('animal')) return faPaw;
  if (amenityLower.includes('walk') || amenityLower.includes('trail') || amenityLower.includes('path')) return faPersonWalking;
  
  // Access & Entry
  if (amenityLower.includes('access') || amenityLower.includes('entry') || amenityLower.includes('key')) return faKey;
  if (amenityLower.includes('door')) return faHouseChimney;
  
  // Default
  return faCheck;
};

// Map pet types to FontAwesome icons
const getPetIcon = (petId: string) => {
  switch (petId.toLowerCase()) {
    case 'dogs':
      return faDog;
    case 'cats':
      return faCat;
    case 'birds':
      return faDove;
    case 'fish':
      return faFish;
    case 'rabbits':
    case 'other':
      return faOtter;
    case 'horses':
      return faHorse;
    default:
      return faPaw;
  }
};

// Map venue types to FontAwesome icons
const getVenueIcon = (venueType: string) => {
  switch (venueType.toLowerCase()) {
    case 'park':
      return faTree;
    case 'cafe':
      return faMugSaucer;
    case 'restaurant':
      return faUtensils;
    case 'home':
      return faHouse;
    case 'hotel':
      return faHotel;
    case 'shop':
      return faCartShopping;
    case 'custom':
      return faBuilding;
    default:
      return faBuilding;
  }
};

const ListingDetails: React.FC = () => {
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const foundListing = await DataService.getListing(id || '');
        setListing(foundListing);
      } catch (error) {
        console.error('Failed to fetch listing:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchListing();
    }
  }, [id]);

  if (loading) {
    return <div className="loading">Loading listing details...</div>;
  }

  if (!listing) {
    return (
      <div className="not-found">
        <h2>Listing Not Found</h2>
        <p>Sorry, we couldn't find a listing with that ID.</p>
        <Link to={ROUTES.LISTINGS} className="btn">Back to Listings</Link>
      </div>
    );
  }

  return (
    <div className="listing-details">
      {/* Photo Gallery */}
      <div className="listing-gallery">
        {listing.photos && listing.photos.length > 0 ? (
          <div className="gallery-grid">
            <div className="gallery-main">
              <img 
                src={`/images/venues/${listing.photos[currentPhotoIndex]}`} 
                alt={`${listing.name}`}
                onClick={() => setCurrentPhotoIndex((currentPhotoIndex + 1) % listing.photos.length)}
              />
            </div>
            {listing.photos.length > 1 && (
              <div className="gallery-thumbnails">
                {listing.photos.slice(0, 4).map((photo, idx) => (
                  <div 
                    key={idx}
                    className={`gallery-thumb ${idx === currentPhotoIndex ? 'active' : ''}`}
                    onClick={() => setCurrentPhotoIndex(idx)}
                  >
                    <img src={`/images/venues/${photo}`} alt={`${listing.name} ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="gallery-placeholder">
            <div className="placeholder-icon">
              {LISTING_TYPES.find((t: ListingType) => t.id === listing.type)?.icon || '🏠'}
            </div>
            <p>Photo gallery</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="listing-content">
        <div className="listing-content-wrapper">
          <div className="listing-main">
            {/* Title and basic info */}
            <div className="listing-header-info">
              <div className="listing-title-row">
                <h1>{listing.name}</h1>
                <div className="venue-type-badge">
                  <FontAwesomeIcon icon={getVenueIcon(listing.type)} className="venue-icon" />
                  <span>{LISTING_TYPES.find((t: ListingType) => t.id === listing.type)?.name}</span>
                </div>
              </div>
              <div className="listing-meta">
                <div className="meta-item">
                  <FontAwesomeIcon icon={faStar} className="star-icon" />
                  <span>{listing.rating.toFixed(1)}</span>
                  <span className="meta-separator">·</span>
                  <span>{listing.reviews.length} reviews</span>
                </div>
                <span className="meta-separator">·</span>
                <div className="meta-item">
                  <FontAwesomeIcon icon={faLocationDot} className="location-icon" />
                  <span>{listing.location}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="listing-section">
              <h2>About this place</h2>
              <p>{listing.description}</p>
            </div>

            {/* Amenities */}
            <div className="listing-section">
              <h2>What this place offers</h2>
              <div className="amenities-list">
                {listing.amenities.map((amenity, index) => (
                  <div key={index} className="amenity-item">
                    <FontAwesomeIcon icon={getAmenityIcon(amenity)} className="amenity-icon" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="listing-sidebar">
            <div className="sidebar-card">
              {/* Allowed Pets */}
              <div className="card-section">
                <h3>Allowed Pets</h3>
                <div className="pets-list">
                  {listing.allowedPets.map((petId) => {
                    const pet = PET_TYPES.find(p => p.id === petId);
                    return pet ? (
                      <div key={petId} className="pet-item">
                        <FontAwesomeIcon icon={getPetIcon(petId)} className="pet-icon-fa" />
                        <span>{pet.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Contact Info */}
              {(listing.contactInfo?.phone || listing.contactInfo?.email || listing.contactInfo?.website) && (
                <div className="card-section">
                  <h3>Contact</h3>
                  <div className="contact-list">
                    {listing.contactInfo?.phone && (
                      <div className="contact-item">
                        <FontAwesomeIcon icon={faPhone} className="contact-icon" />
                        <span>{listing.contactInfo.phone}</span>
                      </div>
                    )}
                    {listing.contactInfo?.email && (
                      <div className="contact-item">
                        <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
                        <span>{listing.contactInfo.email}</span>
                      </div>
                    )}
                    {listing.contactInfo?.website && (
                      <div className="contact-item">
                        <FontAwesomeIcon icon={faGlobe} className="contact-icon" />
                        <a href={listing.contactInfo.website} target="_blank" rel="noopener noreferrer">
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;
