import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar,
  faTree,
  faMugSaucer,
  faUtensils,
  faHouse,
  faHotel,
  faCartShopping,
  faBuilding,
  faDog,
  faCat,
  faDove,
  faFish,
  faOtter,
  faHorse,
  faPaw
} from '@fortawesome/free-solid-svg-icons';
import '../styles/ListingCard.css';
import { Listing, ListingType } from '../types/types';
import { LISTING_TYPES } from '../data/constants';
import { PET_TYPES } from '../data/constantsJsx';

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

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  return (
    <Link to={`/listing/${listing.id}`} className="listing-card">
      <div className="listing-image">
        {listing.photos && listing.photos.length > 0 ? (
          <img src={`/images/venues/${listing.photos[0]}`} alt={listing.name} />
        ) : (
          <div className="image-placeholder">
            <FontAwesomeIcon icon={getVenueIcon(listing.type)} />
          </div>
        )}
        <div className="image-overlay">
          <div className="overlay-type">
            <FontAwesomeIcon icon={getVenueIcon(listing.type)} />
            <span>{LISTING_TYPES.find((t: ListingType) => t.id === listing.type)?.name}</span>
          </div>
          <div className="overlay-rating">
            <FontAwesomeIcon icon={faStar} className="star-icon" />
            <span className="rating-value">{(listing.rating ?? 0).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="listing-details-under-name">
        <h3>{listing.name}</h3>
        <div className="listing-address">{listing.location}</div>
      </div>

      <div className="listing-card-footer">
        <div className="allowed-pets-horizontal">
          {listing.allowedPets.map(petId => {
            const pet = PET_TYPES.find(p => p.id === petId);
            return pet ? (
              <span key={pet.id} className="pet-icon-fa" title={pet.name}>
                <FontAwesomeIcon icon={getPetIcon(petId)} />
              </span>
            ) : null;
          })}
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
