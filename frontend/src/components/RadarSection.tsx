import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../data/constants';
import '../styles/RadarSection.css';

const RadarSection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Radar ping animation
    interface Ping {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
      speed: number;
    }

    interface Dot {
      x: number;
      y: number;
      brightness: number;
      maxBrightness: number;
      fadeSpeed: number;
    }

    const pings: Ping[] = [];
    const dots: Dot[] = [];
    let lastPingTime = 0;
    const pingInterval = 4000; // Create new ping every 4 seconds

    // Center point (where radar originates from - bottom center, behind the div)
    const centerX = canvas.width / (2 * window.devicePixelRatio);
    const centerY = canvas.height / window.devicePixelRatio + 50; // Below the visible area

    // Generate random dots scattered across the canvas
    const generateDots = () => {
      const rect = canvas.getBoundingClientRect();
      const numDots = 25; // Number of dots to scatter
      for (let i = 0; i < numDots; i++) {
        dots.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          brightness: 0,
          maxBrightness: 0.6 + Math.random() * 0.4, // Random brightness between 0.6 and 1.0
          fadeSpeed: 0.01 + Math.random() * 0.02, // Random fade speed
        });
      }
    };

    generateDots();

    const createPing = () => {
      pings.push({
        x: centerX,
        y: centerY,
        radius: 0,
        maxRadius: Math.max(canvas.width, canvas.height) / window.devicePixelRatio,
        opacity: 1,
        speed: 2.5, // Faster animation
      });
    };

    const animate = (timestamp: number) => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Create new ping every 4 seconds
      if (timestamp - lastPingTime > pingInterval) {
        createPing();
        lastPingTime = timestamp;
      }

      // Update and draw dots
      dots.forEach(dot => {
        // Check if any ping is crossing this dot
        let isBeingHit = false;
        pings.forEach(ping => {
          const distance = Math.sqrt(
            Math.pow(dot.x - ping.x, 2) + Math.pow(dot.y - ping.y, 2)
          );
          // If ping is within 30 pixels of the dot, light it up
          if (Math.abs(distance - ping.radius) < 30 && ping.opacity > 0.3) {
            isBeingHit = true;
            dot.brightness = Math.min(dot.maxBrightness, dot.brightness + 0.15);
          }
        });

        // Fade out if not being hit
        if (!isBeingHit) {
          dot.brightness = Math.max(0, dot.brightness - dot.fadeSpeed);
        }

        // Draw dot if visible
        if (dot.brightness > 0.05) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34, 197, 94, ${dot.brightness})`;
          ctx.fill();
          
          // Add a subtle glow
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34, 197, 94, ${dot.brightness * 0.3})`;
          ctx.fill();
        }
      });

      // Update and draw pings
      for (let i = pings.length - 1; i >= 0; i--) {
        const ping = pings[i];
        
        // Update ping
        ping.radius += ping.speed;
        ping.opacity = Math.max(0, 1 - (ping.radius / ping.maxRadius));

        // Remove ping if fully expanded
        if (ping.opacity <= 0) {
          pings.splice(i, 1);
          continue;
        }

        // Draw main ping ring with gradient - GREEN and subtle
        const gradient = ctx.createRadialGradient(
          ping.x, ping.y, Math.max(0, ping.radius - 30),
          ping.x, ping.y, ping.radius + 30
        );
        
        // Green color: rgba(34, 197, 94, ...) - emerald green
        gradient.addColorStop(0, `rgba(34, 197, 94, 0)`);
        gradient.addColorStop(0.5, `rgba(34, 197, 94, ${ping.opacity * 0.25})`); // Reduced from 0.8 to 0.25
        gradient.addColorStop(1, `rgba(34, 197, 94, 0)`);

        ctx.beginPath();
        ctx.arc(ping.x, ping.y, ping.radius, 0, Math.PI * 2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 40; // Reduced from 50 to 40
        ctx.stroke();

        // Draw secondary subtle ring
        ctx.beginPath();
        ctx.arc(ping.x, ping.y, ping.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(74, 222, 128, ${ping.opacity * 0.2})`; // Lighter green, reduced from 0.6 to 0.2
        ctx.lineWidth = 2; // Reduced from 3 to 2
        ctx.stroke();

        // Draw inner glow - subtle green
        if (ping.radius < 100) {
          ctx.beginPath();
          ctx.arc(ping.x, ping.y, ping.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(34, 197, 94, ${(1 - ping.radius / 100) * 0.3})`; // Reduced from 0.8 to 0.3
          ctx.lineWidth = 6; // Reduced from 8 to 6
          ctx.stroke();
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    createPing(); // Initial ping
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <section className="radar-section">
      <div className="radar-background"></div>
      <canvas ref={canvasRef} className="radar-canvas"></canvas>
      <div className="radar-content">
        <div className="radar-text">
          <h2>Introducing Octopets Radar</h2>
          <p>
            Discover pet-friendly places in real-time with our AI-powered location finder. 
            Get instant recommendations based on where you are and what your pet needs.
          </p>
          <div className="radar-features">
            <div className="radar-feature">
              <span className="radar-feature-icon">🎯</span>
              <span>Real-time discovery</span>
            </div>
            <div className="radar-feature">
              <span className="radar-feature-icon">🤖</span>
              <span>AI-powered matching</span>
            </div>
            <div className="radar-feature">
              <span className="radar-feature-icon">📍</span>
              <span>Location-aware</span>
            </div>
          </div>
          <div className="radar-cta">
            <Link to={ROUTES.LISTINGS} className="btn btn-outline radar-btn">
              Explore nearby places
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RadarSection;
