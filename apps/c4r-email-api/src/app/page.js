'use client';

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await fetch('/api/c4rEmailApi');
      const data = await response.json();
      setEmails(data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/c4rEmailApi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ text: "Email saved successfully!", type: "success" });
        setEmail("");
        fetchEmails(); // Refresh the email list
      } else {
        setMessage({ text: data.error || "Failed to save email", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Failed to save email", type: "error" });
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Email Subscription System</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Submit
        </button>
      </form>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <div className={styles.tableContainer}>
        <h2>Submitted Emails</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Submission Date</th>
            </tr>
          </thead>
          <tbody>
            {emails.map((entry) => (
              <tr key={entry._id}>
                <td>{entry.email}</td>
                <td>{new Date(entry.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
