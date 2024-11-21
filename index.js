const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { detectFile } = require("magic-bytes.js"); // Import magic-bytes for file validation

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));

// Hardcoded values for user_id, college_email, and roll_number
const USER_ID = "Aryan_Yadav_05122003";
const COLLEGE_EMAIL = "aryanyadav210034@acropolis.in";
const ROLL_NUMBER = "0827IT211019";

// Function to validate if a string is a valid Base64
const isValidBase64 = (str) => {
  try {
    // Check if Base64 string has valid format
    return Buffer.from(str, "base64").toString("base64") === str.replace(/\n|\r/g, "");
  } catch (error) {
    return false;
  }
};

// GET endpoint: Return operation code
app.get("/bfhl", (req, res) => {
  res.status(200).json({
    operation_code: "GET_200_SUCCESS",
  });
});

// POST endpoint: Handle JSON and File inputs
app.post("/bfhl", async (req, res) => {
  const { data, file_b64 } = req.body;

  // Validate input
  if (!data || !Array.isArray(data)) {
    return res.status(400).json({
      is_success: false,
      message: "Missing or invalid 'data' field",
    });
  }

  // Separate numbers and alphabets
  const numbers = data.filter((item) => !isNaN(item));
  const alphabets = data.filter((item) => /^[a-zA-Z]$/.test(item));

  // Find the highest lowercase alphabet
  const highestLowercase = alphabets
    .filter((char) => char >= "a" && char <= "z")
    .sort()
    .slice(-1)[0] || null;

  // Check if prime number is found
  const isPrime = (num) => {
    num = parseInt(num, 10);
    if (isNaN(num) || num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  };

  const primeFound = numbers.some(isPrime);

  // File handling
  let file_valid = false;
  let file_mime_type = null;
  let file_size_kb = 0;

  if (file_b64) {
    try {
      // Validate Base64 format
      if (!isValidBase64(file_b64)) {
        throw new Error("Invalid Base64 string");
      }

      // Decode Base64 string
      const fileBuffer = Buffer.from(file_b64, "base64");

      // Detect MIME type using `magic-bytes.js`
      const fileTypeResult = detectFile(fileBuffer);
      if (fileTypeResult.length > 0) {
        file_mime_type = fileTypeResult[0].mime;
        file_valid = true;
      }

      // Calculate file size
      file_size_kb = (fileBuffer.byteLength / 1024).toFixed(2);
    } catch (error) {
      console.error("File processing error:", error.message);
      file_valid = false;
      file_mime_type = null;
      file_size_kb = 0;
    }
  }

  // Response
  res.status(200).json({
    is_success: true,
    user_id: USER_ID,
    college_email: COLLEGE_EMAIL,
    college_roll_number: ROLL_NUMBER,
    numbers,
    alphabets,
    highest_lowercase: highestLowercase ? [highestLowercase] : [],
    prime_found: primeFound,
    file_info: {
      file_valid,
      file_mime_type,
      file_size_kb,
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
