import React from "react";

const CategorySidebar = ({ categories, selectedCat, onSelectCategory }) => {
  return (
    <div
      className="sidebar-card"
      style={{
        background: "#fff9f2",
        padding: "1.5rem",
        borderRadius: "1.5rem",
        boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
      }}
    >
      {categories.map((cat, index) => (
        <button
          key={index}
          onClick={() => onSelectCategory(cat.id)}
          style={{
            display: "block",
            width: "100%",
            padding: "0.75rem 1rem",
            marginBottom: "0.75rem",
            borderRadius: "1rem",
            border: "1px solid #e5d8c6",
            backgroundColor: selectedCat === cat.id ? "#7a563a" : "#fff",
            color: selectedCat === cat.id ? "#fff" : "#7a563a",
            fontWeight: selectedCat === cat.id ? "600" : "500",
            textAlign: "left",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default CategorySidebar;
