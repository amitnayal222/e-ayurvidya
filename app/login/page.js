"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Login() {
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
const [college, setCollege] = useState("");
const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();


  const login = async () => {
    setError("");
    setMessage("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          createdAt: serverTimestamp(),
          role: "user",
        });
      }

      router.push("/notes");
    } catch {
      setError("Invalid email or password");
    }
  };

  const signup = async () => {
    setError("");
    setSuccess("");
    setMessage("");

    if (!email || !password || !confirmPassword || !name) {
          setError("All required fields must be filled");
          return;
        }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!phone) {
    setError("Phone number is required");
    return;
  }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name,
        phone,
        college: college || "",
        createdAt: serverTimestamp(),
        role: "user",
      });
    // ✅ Sign out immediately to force login
    try {
      await auth.signOut();
    } catch (err) {
      console.warn("Sign out failed:", err);
    }
      // ✅ Success message
    setSuccess("Account created successfully! Please login.");

    // Redirect after short delay (1.5s)
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
       

    
    } catch (error) {
    console.error("Signup error:", error);

    // 🔹 Handle specific Firebase Auth errors
    if (error.code === "auth/email-already-in-use") {
      setError("This email is already registered. Please login.");
    } else if (error.code === "auth/invalid-email") {
      setError("Invalid email address.");
    } else if (error.code === "auth/weak-password") {
      setError("Password should be at least 6 characters.");
    } else {
      setError(error.message);
    }
  }
  };

  const resetPassword = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent!");
      setMode("login");
    } catch {
      setError("Failed to send reset email");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.brandContainer}>
        <Image
          src="/ayurvidya-logo.png"
          alt="AyurVidya Logo"
          width={120}
          height={120}
          style={styles.logo}
        />

        <div style={styles.brandText}>
          <h1 style={styles.brandName}>
            <span style={styles.prefix}>e-</span>
            <span style={styles.ayur}>Ayur</span>
            <span style={styles.vidya}>Vidya</span>
          </h1>
          <p style={styles.tagline}>Your digital Ayurveda notes</p>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardHeader}>
          {mode === "login" && "Login to your account"}
          {mode === "signup" && "Create a new account"}
          {mode === "forgot" && "Reset your password"}
        </h2>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}
        {success && <p style={styles.success}>{success}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        {mode !== "forgot" && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        )}

       {mode === "signup" && (
        <>
        <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.input}
          />

          <input
            type="text"
            placeholder="College Name (Optional)"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            style={styles.input}
          />

          
        </>
      )}


        <button
          style={styles.loginBtn}
          onClick={
            mode === "login"
              ? login
              : mode === "signup"
              ? signup
              : resetPassword
          }
        >
          {mode === "login" && "Login"}
          {mode === "signup" && "Create Account"}
          {mode === "forgot" && "Send Reset Link"}
        </button>

        {mode === "login" && (
          <p style={styles.forgotText} onClick={() => setMode("forgot")}>
            Forgot Password?
          </p>
        )}

        <p style={styles.switchText}>
          {mode === "login" && "Don't have an account?"}
          {mode === "signup" && "Already have an account?"}
          {mode === "forgot" && "Remember your password?"}

          <span
            style={styles.switchLink}
            onClick={() =>
              setMode(
                mode === "login" ? "signup" : "login"
              )
            }
          >
            {mode === "login" && " Sign Up"}
            {mode === "signup" && " Login"}
            {mode === "forgot" && " Login"}
          </span>
        </p>

        <div style={styles.divider} />

        <div style={styles.infoSection}>
          <p style={styles.infoText}>
            New here? Please read the general instructions before accessing the notes.
          </p>

          <button
            style={styles.instructionsLink}
            onClick={() => router.push("/instructions")}
          >
            📘 View General Instructions
          </button>
        </div>
      </div>
    </div>
  );
}


const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    fontFamily: "'Inter', sans-serif",
    padding: "20px",
  },
  brandContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "30px",
    gap: "20px",
  },
  logo: {
    borderRadius: "50%",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  brandText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  brandName: {
  fontSize: "2rem",
  margin: 0,
  fontWeight: 700,
  whiteSpace: "nowrap",   // prevents line break
},
  prefix: {
    color: "#10b981", // green for 'e-'
  },
  ayur: {
    color: "#0ea5e9", // blue
  },
  vidya: {
    color: "#f59e0b", // amber
  },
  tagline: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#555",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    padding: "30px",
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    marginBottom: "20px",
    textAlign: "center",
    color: "#0ea5e9",
  },
  input: {
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  loginBtn: {
    padding: "12px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#0ea5e9",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  signupBtn: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #0ea5e9",
    backgroundColor: "#fff",
    color: "#0ea5e9",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  error: {
    color: "crimson",
    marginBottom: "12px",
    textAlign: "center",
  },
  divider: {
  height: "1px",
  background: "#e5e7eb",
  margin: "20px 0",
},

infoSection: {
  textAlign: "center",
},

infoText: {
  fontSize: "0.85rem",
  color: "#6b7280",
  marginBottom: "10px",
},

instructionsLink: {
  background: "transparent",
  border: "none",
  color: "#10b981",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.9rem",
},
success: {
  color: "green",
  marginBottom: "12px",
  textAlign: "center",
},

forgotText: {
  marginTop: "8px",
  textAlign: "right",
  fontSize: "0.85rem",
  color: "#0ea5e9",
  cursor: "pointer",
},

switchText: {
  marginTop: "15px",
  textAlign: "center",
  fontSize: "0.9rem",
  color: "#555",
},

switchLink: {
  color: "#10b981",
  fontWeight: 600,
  cursor: "pointer",
  marginLeft: "5px",
},

};


