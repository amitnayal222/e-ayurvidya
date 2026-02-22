"use client";

export default function FolderCard({ folder, onClick }) {
  return (
    <div
      style={card}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.06)";
      }}
    >
      <h3 style={title}>{folder.title}</h3>
      <p style={desc}>
        {folder.description?.length > 100
          ? folder.description.substring(0, 100) + "..."
          : folder.description || "No description"}
      </p>
      <button style={openBtn} onClick={onClick}>
        Open Folder
      </button>
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const card = {
  background: "#fff",
  padding: 24,
  borderRadius: 16,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  cursor: "pointer",
  transition: "all 0.2s",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  height: "100%",
};

const title = {
  fontSize: 18,
  fontWeight: 600,
  color: "#111827",
  marginBottom: 8,
	textAlign: "center",
};

const desc = {
  fontSize: 14,
  color: "#6b7280",
  marginBottom: 16,
  flexGrow: 1,
};

const openBtn = {
  padding: "10px 20px",
  borderRadius: 12,
  border: "none",
  background: "#16a34a",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 15,
  transition: "all 0.2s",
};

openBtn.hover = {
  background: "#15803d",
};

