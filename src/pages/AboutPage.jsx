import React, { useEffect, useState } from "react";
import { Footer, Navbar } from "../components";
import api from "../utils/base_url"; // axios instance with baseURL

const AboutPage = () => {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch categories
  const fetchCategories = async (pageNum = 1) => {
    try {
      const res = await api.get(`/categories/?page=${pageNum}`);
      if (res.data && res.data.data) {
        if (pageNum === 1) {
          setCategories(res.data.data);
        } else {
          setCategories((prev) => [...prev, ...res.data.data]);
        }

        // If fewer than 10 returned → no more pages
        if (res.data.data.length < 10) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories(1); // load first page
  }, []);

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center">About Us</h1>
        <hr />
        <p className="lead text-center">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
          facere doloremque veritatis odit similique sequi. Odit amet fuga nam
          quam quasi facilis sed doloremque saepe sint perspiciatis explicabo
          totam vero quas provident ipsam, veritatis nostrum velit quos
          recusandae est mollitia esse fugit dolore laudantium.
        </p>

        <h2 className="text-center py-4">Our Categories</h2>

        {/* Grid Layout */}
        <div className="grid-container">
          {categories.slice(0, 4).map((cat) => (
            <div key={cat.id} className="card text-center h-100">
              <img
                className="card-img-top p-3"
                src={
                  cat.category_image
                    ? `${process.env.REACT_APP_API_URL}${cat.category_image}`
                    : "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={cat.category_name}
                style={{ height: "180px", objectFit: "contain" }}
              />
              <div className="card-body">
                <h5 className="card-title text-center">{cat.category_name}</h5>
                <p className="text-center small">
                  {cat.description || "No description"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Show More button */}
        {hasMore && categories.length > 4 && (
          <div className="text-center mt-3">
            <button
              className="btn btn-outline-primary"
              onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchCategories(nextPage);
              }}
            >
              Show More
            </button>
          </div>
        )}
      </div>
      <Footer />

      {/* Grid CSS same as Products.jsx */}
      <style>
        {`
          .grid-container {
            display: grid;
            grid-template-columns: repeat(5, 1fr); /* 5 per row */
            gap: 20px;
          }

          @media (max-width: 1400px) {
            .grid-container {
              grid-template-columns: repeat(4, 1fr);
            }
          }

          @media (max-width: 1200px) {
            .grid-container {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          @media (max-width: 768px) {
            .grid-container {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 576px) {
            .grid-container {
              grid-template-columns: repeat(1, 1fr);
            }
          }
        `}
      </style>
    </>
  );
};

export default AboutPage;
