import React from 'react';
import '../styles/PetPolaroid.css';

interface PetPolaroidProps {
  image: string;
  name: string;
  type: string;
  description: string;
  funFact?: string;
  onClose: () => void;
}

const PetPolaroid: React.FC<PetPolaroidProps> = ({
  image,
  name,
  type,
  description,
  funFact,
  onClose
}) => {
  return (
    <div className="polaroid-overlay" onClick={onClose}>
      <div className="polaroid-card" onClick={(e) => e.stopPropagation()}>
        <div className="polaroid-photo">
          <img src={image} alt={name} />
        </div>
        <div className="polaroid-caption">
          <h3>{name}</h3>
          <p className="polaroid-type">{type}</p>
          <p className="polaroid-description">{description}</p>
          {funFact && (
            <p className="polaroid-fun-fact">
              <span className="fun-fact-label">Fun fact:</span> {funFact}
            </p>
          )}
        </div>
        <button className="polaroid-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
    </div>
  );
};

export default PetPolaroid;
