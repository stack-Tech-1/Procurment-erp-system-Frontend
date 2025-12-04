"use client";
import { useState } from "react";
import AuthLayout from "@/components/AuthLayout";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "technical"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Implement support ticket submission
    alert("Support request submitted! We'll contact you within 24 hours.");
  };

  // ... similar layout structure
}