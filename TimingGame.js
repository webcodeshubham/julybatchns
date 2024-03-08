// Constants for API URL and DOM elements
const RANDOM_QUOTE_API_URL = "http://api.quotable.io/random"; // API URL for fetching random quotes
const container = document.getElementById("container"); // Reference to the container element
const quoteDisplayElement = document.getElementById("quoteDisplay"); // Reference to the quote display element
const timerElement = document.getElementById("timer"); // Reference to the timer element
const wpmElement = document.getElementById("wpm"); // Reference to the WPM element

// Variables for application state and tracking
let timerID; // ID for the timer interval
let isTimerStarted = false; // Flag to track if the timer is started
let quote = ''; // Variable to hold the current quote
let currentIndex = 0; // Index to track the current character being typed
let strokes = []; // Array to track correctness of typed characters

// Event listener to start timer when container is clicked
window.addEventListener("click", (e) => {
  const isInsideContainer = container.contains(e.target); // Check if the click is inside the container
  if (isInsideContainer && !isTimerStarted) { // If clicked inside container and timer is not started
    container.classList.add("container-focus"); // Add focus class to the container
    startTimer(); // Start the timer
  } else if (!isInsideContainer) { // If clicked outside the container
    reset(); // Reset the application state
  }
});

// Event listener to capture keyboard inputs
window.addEventListener("keydown", (e) => {
  if (!isTimerStarted) return; // If timer is not started, do nothing
  
  const char = e.key; // Get the typed character
  const correctChar = quote[currentIndex]; // Get the correct character from the quote
  const isCorrect = char === correctChar; // Check if typed character matches the correct character
  
  // Toggle correct and incorrect classes based on correctness of typed character
  quoteDisplayElement.childNodes[currentIndex].classList.toggle("correct", isCorrect);
  quoteDisplayElement.childNodes[currentIndex].classList.toggle("incorrect", !isCorrect);

  if (isCorrect) strokes[currentIndex] = 1; // Update strokes array if character is correct

  // Move to next character or render new quote if end of quote is reached
  currentIndex = (char === 'Backspace') ? Math.max(currentIndex - 1, 0) : currentIndex + 1;
  if (currentIndex === quote.length) {
    renderNewQuote(); // If end of quote is reached, render new quote
  }

  calculateWPM(); // Calculate and update WPM
});

// Fetch a random quote from the API
const getRandomQuote = async () => {
  const response = await fetch(RANDOM_QUOTE_API_URL); // Fetch data from API
  const data = await response.json(); // Parse response as JSON
  return data.content; // Return the quote content
};

// Reset the application state
function reset() {
  container.classList.remove("container-focus"); // Remove focus class from the container
  timerElement.innerText = 0; // Reset the timer display
  stopTimer(); // Stop the timer
  currentIndex = 0; // Reset current index
  strokes = []; // Clear strokes array
  // Remove correct and incorrect classes from quote display elements
  quoteDisplayElement.childNodes.forEach(node => node.classList.remove("correct", "incorrect"));
}

// Calculate words per minute
function calculateWPM() {
  if (isTimerStarted) { // If timer is started
    const timeElapsed = getTimerTime(); // Get elapsed time
    const correctStrokeCount = strokes.reduce((count, stroke) => count + stroke, 0); // Calculate correct strokes
    const wpm = Math.round(correctStrokeCount / 5 / (timeElapsed / 60)); // Calculate WPM
    wpmElement.innerText = wpm || 0; // Update WPM display
  }
}

// Render a new random quote
const renderNewQuote = async () => {
  if (isTimerStarted) stopTimer(); // Stop timer if started
  quote = await getRandomQuote(); // Fetch new quote
  currentIndex = 0; // Reset current index
  strokes = new Array(quote.length).fill(0); // Initialize strokes array
  // Render the new quote on the quote display element
  quoteDisplayElement.innerHTML = quote.split("").map(char => `<span>${char}</span>`).join("");
  startTimer(); // Start the timer
};

// Start the timer
let startTime;
function startTimer() {
  isTimerStarted = true; // Set timer started flag
  startTime = new Date(); // Record start time
  timerID = setInterval(() => {
    timerElement.innerText = getTimerTime(); // Update timer display
    calculateWPM(); // Calculate and update WPM
  }, 1000); // Update every second
}

// Get the elapsed time since timer start
function getTimerTime() {
  return Math.floor((new Date() - startTime) / 1000); // Calculate elapsed time in seconds
}

// Stop the timer
function stopTimer() {
  isTimerStarted = false; // Set timer started flag to false
  clearInterval(timerID); // Clear the timer interval
}

// Initialize the application by rendering a new quote
renderNewQuote();
