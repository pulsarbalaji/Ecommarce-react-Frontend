import React, { useCallback, useEffect, useState } from "react";
import api from "../utils/base_url";
import toast from "react-hot-toast";

const ReviewBox = ({ productId }) => {
    const [summary, setSummary] = useState(null);   // left side summary
    const [reviews, setReviews] = useState([]);     // right side reviews
    const [activeStar, setActiveStar] = useState(null); // filter star
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetchSummary = useCallback(async () => {
        try {
            const res = await api.get(`/product-rating-summary/${productId}/`);
            setSummary(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load rating summary");
        }
    }, [productId]);


    const fetchReviews = useCallback(
        async (pageNum = 1, starFilter = activeStar) => {
            try {
                setLoading(true);

                const url = `/product-feedback-filter/${productId}/?page=${pageNum}${starFilter ? `&rating=${starFilter}` : ""
                    }`;

                const res = await api.get(url);
                const db = res.data.results;

                if (pageNum === 1) setReviews(db);
                else setReviews((prev) => [...prev, ...db]);

                setHasMore(res.data.next !== null);
                setLoading(false);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load reviews");
                setLoading(false);
            }
        },
        [productId, activeStar] // correct deps
    );

    // On component load
    useEffect(() => {
        fetchSummary();
        fetchReviews(1);
    }, [fetchSummary, fetchReviews]);


    // On filter click
    const handleFilter = (star) => {
        setActiveStar(star);
        setPage(1);
        fetchReviews(1, star);
    };

    // Load next page
    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchReviews(nextPage);
    };

    if (!summary) return <p>Loading reviews…</p>;

    return (
        <div className="review-container">
            {/* LEFT: SUMMARY */}
            <div className="review-left">
                <h3 className="title">Customer Reviews</h3>
                <div className="rating-summary-box">
                    <div className="rating-top">
                        <span className="rating-value">{summary.average}</span>
                        <span className="rating-value">out of 5</span>
                    </div>

                    <div className="rating-stars">
                        {"★".repeat(Math.round(summary.average))}
                        {"☆".repeat(5 - Math.round(summary.average))}
                    </div>

                    <div className="rating-total">{summary.total} global ratings</div>
                </div>


                {/* STAR PERCENTAGE BARS */}
                <div className="star-bars">
                    {[5, 4, 3, 2, 1].map((star) => (
                        <div className="bar-row" key={star}>
                            <span className="star-label">{star} ★</span>
                            <div className="bar-track">
                                <div
                                    className="bar-fill"
                                    style={{ width: `${summary.percentage[star]}%` }}
                                ></div>
                            </div>
                            <span className="bar-count">{summary.counts[star]}</span>
                        </div>
                    ))}
                </div>

                {/* FILTER BUTTONS */}
                <div className="filter-buttons">
                    <button
                        className={!activeStar ? "active" : ""}
                        onClick={() => handleFilter(null)}
                    >
                        All Reviews
                    </button>

                    {[5, 4, 3, 2, 1].map((star) => (
                        <button
                            key={star}
                            className={activeStar === star ? "active" : ""}
                            onClick={() => handleFilter(star)}
                        >
                            {star} ★
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT: REVIEWS LIST */}
            <div className="review-right">
                {reviews.length === 0 ? (
                    <div className="no-review-green">
                        <i className="fa fa-comments"></i>
                        <p>No reviews yet</p>
                        <small>Be the first to share your experience</small>
                    </div>

                ) : (
                    reviews.map((rev) => (
                        <div className="review-card" key={rev.id}>
                            <div className="review-stars">
                                {"★".repeat(rev.rating)}
                                {"☆".repeat(5 - rev.rating)}
                            </div>
                            <div className="review-user">{rev.user_name}</div>
                            <div className="review-comment">{rev.comment}</div>
                            <div className="review-date">
                                {new Date(rev.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}

                {/* Load More */}
                {hasMore && !loading && (
                    <div className="load-more-container">
                        <button className="load-more" onClick={loadMore}>
                            Load More
                        </button>
                    </div>

                )}

                {loading && <p>Loading...</p>}
            </div>

            {/* CSS STYLE */}
            <style>{`
        .review-container {
          display: flex;
          gap: 40px;
          padding: 30px;
          background: #fffaf4;
          border-radius: 12px;
          margin-top: 10px;
        }

        /* Left */
        .review-left {
          width: 30%;
        }
        .title {
          font-weight: 700;
          color: #2f3e46;
          margin-bottom: 15px;
        }
        .avg-number {
          font-size: 2.5rem;
          color: #198754;
          margin: 0;
        }
        .total-count {
          margin: 0;
          color: #555;
        }

        .star-bars {
          margin-top: 20px;
        }
        .bar-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .star-label {
          width: 40px;
        }
        .bar-track {
          height: 8px;
          background: #eee;
          width: 100%;
          border-radius: 5px;
          overflow: hidden;
        }
        .bar-fill {
          height: 8px;
          background: #198754;
        }
        .bar-count {
          width: 25px;
          text-align: right;
          color: #333;
        }

        /* FILTER BUTTONS */
        .filter-buttons {
          margin-top: 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .filter-buttons button {
          border: 1px solid #198754;
          background: white;
          padding: 6px 14px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 600;
        }
        .filter-buttons .active {
          background: #198754;
          color: white;
        }

        /* Right */
        .review-right {
          width: 70%;
        }
        .review-card {
          background: white;
          padding: 15px;
          border-radius: 10px;
          border: 1px solid #e6d2b5;
          margin-bottom: 15px;
        }

        .review-stars {
          color: #ffb400;
          font-size: 1.1rem;
        }
        .review-user {
          font-weight: bold;
          color: #2f3e46;
        }
        .review-comment {
          margin: 10px 0;
        }
        .review-date {
          font-size: 0.85rem;
          color: gray;
        }

        .load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.load-more {
  background: #198754;
  color: white;
  padding: 10px 28px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0px 4px 10px rgba(25,135,84,0.2);
}

.load-more:hover {
  background: #176b46;
  transform: scale(1.03);
}



        .rating-summary-box {
  padding: 5px 0;
  margin-bottom: 10px;
  line-height: 1.2;
}

.rating-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.rating-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111;
  line-height: 1;
}

.rating-out {
  font-size: 1rem;
  color: #666;
}

.rating-stars {
  font-size: 1.4rem;
  color: #ffa41c;
  letter-spacing: 2px;
  margin-bottom: 6px;
}

.rating-total {
  font-size: 0.95rem;
  color: #444;
  margin-bottom: 8px;
}

.no-review-green {
  text-align: center;
  border: 1px solid #198754;
  border-radius: 12px;
  padding: 30px;
  background: #f4fff6;
  color: #198754;
}

.no-review-green i {
  font-size: 2rem;
  margin-bottom: 8px;
}


        /* Mobile responsiveness */
@media (max-width: 768px) {
  .review-container {
    flex-direction: column;
    padding: 15px;
  }

  .review-left,
  .review-right {
    width: 100%;
  }

  .avg-number {
    font-size: 2rem;
  }

  .filter-buttons {
    display: flex;
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 8px;
  }

  .filter-buttons button {
    flex-shrink: 0;
  }

  .review-card {
    padding: 12px;
  }

  .title {
    font-size: 1.2rem;
  }
}

      `}</style>
        </div>
    );
};

export default ReviewBox;
