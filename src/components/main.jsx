import React, { useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const images = [
  {
    src: "./assets/main.png.jpg",
    alt: "New Season Arrivals",
    title: "New Season Arrivals",
    description:
      "Discover our latest collection crafted with care and style.",
  },
  {
    src: "./assets/second-image.jpg",
    alt: "Exclusive Offers",
    title: "Exclusive Offers",
    description:
      "Grab limited-time deals on your favorite products today!",
  },
];

const Home = () => {
  useEffect(() => {
    const carouselEl = document.querySelector('#homeCarousel');
    if (carouselEl) {
      new window.bootstrap.Carousel(carouselEl, {
        interval: 5000,
        ride: 'carousel',
        touch: true,
        pause: false,
      });
    }
  }, []);

  return (
    <>
      <div
        id="homeCarousel"
        className="carousel slide rounded-theme shadow-theme mx-3 mt-3"
        data-bs-ride="carousel"
        data-bs-interval="5000"
        data-bs-touch="true"
      >
        <div className="carousel-inner rounded-theme">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`carousel-item${idx === 0 ? " active" : ""}`}
            >
              <img
                src={img.src}
                className="d-block w-100 carousel-img"
                alt={img.alt}
                loading="lazy"
              />
              <div className="carousel-caption d-flex flex-column justify-content-center align-items-start text-start text-shadow-custom">
                <h5 className="fs-1 fw-lighter themed-title">{img.title}</h5>
                <p className="fs-5 themed-desc">{img.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .rounded-theme {
          border-radius: 12px !important;
        }

        .shadow-theme {
          box-shadow: 0 5px 16px rgba(122, 86, 58, 0.2);
        }

        .carousel-img {
          width: 100%;
          height: 500px;
          object-fit: cover;
          border-radius: 12px;
          filter: brightness(0.7);
        }

        .carousel-caption {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: 10%;
          max-width: 40%;
          padding: 0;
        }

        .themed-title {
          color: #f1e6d4;
          text-shadow: 2px 2px 4px rgba(122,86,58,0.9), 0 0 10px rgba(122,86,58,0.7);
          font-weight: 300;
        }

        .themed-desc {
          color: #f1e6d4;
          text-shadow: 1px 1px 3px rgba(122,86,58,0.8);
          font-weight: 400;
        }

        .text-shadow-custom {
          text-shadow: 1px 1px 4px rgba(122,86,58,0.8);
        }

        @media (max-width: 768px) {
          .carousel-img {
            height: 300px;
          }

          .carousel-caption {
            max-width: 90%;
            left: 5%;
            text-align: center;
          }

          .themed-title {
            font-size: 1.6rem;
          }

          .themed-desc {
            font-size: 0.9rem;
          }
        }

        .carousel-control-prev,
        .carousel-control-next {
          display: none !important;
        }
      `}</style>
    </>
  );
};

export default Home;
