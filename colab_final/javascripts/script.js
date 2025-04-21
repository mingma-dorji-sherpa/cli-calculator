//for search icon
//start
document.addEventListener("DOMContentLoaded", function () {
  const searchIcon = document.getElementById("searchIcon");
  const searchBar = document.getElementById("searchBar");

  function toggleSearchBar() {
      searchBar.style.display = "block"; // Show search bar
      searchIcon.style.display = "none"; // Hide search icon
      searchBar.focus(); // Focus on the input
  }

  function hideSearchBar(event) {
      if (!searchBar.contains(event.target) && event.target !== searchIcon) {
          searchBar.style.display = "none"; // Hide search bar
          searchIcon.style.display = "block"; // Show search icon
      }
  }

  searchIcon.addEventListener("click", toggleSearchBar);
  document.addEventListener("click", hideSearchBar);
});
//end

//start
//flight deals
function flip(element) {
  element.querySelector(".card1").style.transform = "rotateX(180deg)";
  let video = element.querySelector("video");
  video.play();
}
function unflip(element) {
  element.querySelector(".card1").style.transform = "rotateX(0deg)";
  let video = element.querySelector("video");
  video.pause();
  video.currentTime = 0;
}
//end


  document.addEventListener("DOMContentLoaded", function () {
      const buttons = document.querySelectorAll(".route button");
      const returnField = document.querySelector(".return-group");
  
      function updateActiveButton(selected) {
          buttons.forEach(button => button.classList.remove("active"));
          selected.classList.add("active");
  
          if (selected.classList.contains("way1")) {
              returnField.style.display = "none"; // Hide but keep space
          } else {
              returnField.style.display = "block"; // Show return field
          }
      }
  
      buttons.forEach(button => {
          button.addEventListener("click", function () {
              updateActiveButton(this);
          });
      });
  
      // Set "One Way" as default active
      updateActiveButton(document.querySelector(".way1"));
  });

  // Select the radio buttons and the container for the background image
const radioButtons = document.querySelectorAll('input[name="classType"]');
const imgContainer = document.querySelector('.imgcontainer');

// Define the background images for each class
const backgroundImages = {
  'Economy': 'url(economy.jpeg)',
  'Business': 'url(business.jpg)',  // Replace with the path to your business class image
  'Premium': 'url(firstclass.jpg)'  // Replace with the path to your first class image
};

// Add event listeners to all radio buttons
radioButtons.forEach(radio => {
  radio.addEventListener('change', () => {
      // Check which radio button is selected
      const selectedClass = document.querySelector('input[name="classType"]:checked').value;

      // Update the background image of the imgcontainer
      imgContainer.style.backgroundImage = backgroundImages[selectedClass];
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const departureInput = document.getElementById("departure").querySelector("input[type='date']");
  const returnInput = document.getElementById("return").querySelector("input[type='date']");
  const departureErrorMessage = document.createElement('div');
  const returnErrorMessage = document.createElement('div');

  // Add class to error messages so they can be targeted by CSS
  departureErrorMessage.classList.add('error-message');
  returnErrorMessage.classList.add('error-message');

  departureErrorMessage.textContent = "Departure date cannot be in the past.";
  returnErrorMessage.textContent = "Return date must be within 90 days of departure.";

  // Add error message elements to the DOM for visual display
  document.getElementById("departure").appendChild(departureErrorMessage);
  document.getElementById("return").appendChild(returnErrorMessage);

  // Initially hide error messages
  departureErrorMessage.style.display = "none";
  returnErrorMessage.style.display = "none";

  // Get today's date and set it as the minimum date for departure and return
  const today = new Date();
  const formattedToday = today.toISOString().split("T")[0]; // Get the date in YYYY-MM-DD format
  departureInput.setAttribute("min", formattedToday); // Disable past dates for departure
  returnInput.setAttribute("min", formattedToday); // Disable past dates for return

  // Validate departure date: can't be in the past
  departureInput.addEventListener("input", function () {
      const departureDate = new Date(departureInput.value);

      // Hide error if departure date is valid (not in the past)
      if (departureDate < today) {
          departureErrorMessage.style.display = "none"; // Hide error initially
      } else {
          departureErrorMessage.style.display = "none"; // Hide error if valid
      }

      // Trigger return date validation after both dates are input
      validateReturnDate();
  });

  // Validate return date: must be at least 1 day after departure and within 90 days
  returnInput.addEventListener("input", function () {
      validateReturnDate();
  });

  // Function to validate return date after both departure and return are input
  function validateReturnDate() {
      const departureDate = new Date(departureInput.value);
      const returnDate = new Date(returnInput.value);

      // Ensure both dates are entered
      if (departureInput.value && returnInput.value) {
          const differenceInTime = returnDate - departureDate;
          const differenceInDays = differenceInTime / (1000 * 3600 * 24); // Convert milliseconds to days

          // Check if return date is before departure date or more than 90 days after
          if (differenceInDays < 1) {
              returnErrorMessage.textContent = "Return date cannot be before departure date.";
              returnErrorMessage.style.display = "inline";
              returnInput.setCustomValidity("Return date cannot be before departure date.");
          } else if (differenceInDays > 90) {
              returnErrorMessage.textContent = "Return date must be within 90 days of departure.";
              returnErrorMessage.style.display = "inline";
              returnInput.setCustomValidity("Return date must be within 90 days of departure.");
          } else {
              returnErrorMessage.style.display = "none"; // Hide error message if valid
              returnInput.setCustomValidity(""); // Clear custom validity
          }
      }
  }
});

async function getUserLocation() {
    // Check if location data exists in localStorage
    const storedLocation = localStorage.getItem('userLocation');
    if (storedLocation) {
      const { countryCode } = JSON.parse(storedLocation);
      displayLocation(countryCode);
      return;
    }
  
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async function (position) {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
  
        console.log("Latitude:", lat, "Longitude:", lon);
  
        try {
          let apiKey = "8007b6eb6b594f29af64c9a91a0c7159";
          let geoResponse = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`);
          let geoData = await geoResponse.json();
  
          if (geoData.results && geoData.results.length > 0) {
            let countryCode = geoData.results[0].components.country_code.toUpperCase();
            
            // Save to localStorage
            localStorage.setItem('userLocation', JSON.stringify({ countryCode }));
            
            displayLocation(countryCode);
          } else {
            document.getElementById("countryname").innerText = "Location not found";
          }
        } catch (error) {
          console.error("Error fetching location:", error);
          document.getElementById("countryname").innerText = "Error fetching location";
        }
      }, function (error) {
        console.error("Geolocation error:", error);
        document.getElementById("countryname").innerText = "Permission denied";
      });
    } else {
      console.error("Geolocation not supported.");
      document.getElementById("countryname").innerText = "Geolocation not supported";
    }
  }
  
  function displayLocation(countryCode) {
    document.getElementById("countryflag").src = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
    document.getElementById("countryname").innerText = countryCode;
  }
  
  // Call the function on page load
  getUserLocation();
  
  // Function to retrieve and display stored location (can be called separately if needed)
  function showStoredLocation() {
    const storedLocation = localStorage.getItem('userLocation');
    if (storedLocation) {
      const { countryCode } = JSON.parse(storedLocation);
      displayLocation(countryCode);
      return countryCode;
    } else {
      return null;
    }
  }
  //End
  document.getElementById("flightsearch").addEventListener("click", function () {
      document.getElementById("flightt").classList.add("show");
      document.getElementById("imgs").classList.add("hide");
      document.getElementById("rems").classList.add("hide");
  });

  document.getElementById("showbtn").addEventListener("click", function () {
      document.getElementById("flightt").classList.remove("show");
      document.getElementById("imgs").classList.remove("hide");
      document.getElementById("rems").classList.remove("hide");
  });



  //js for php
  // login.js
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Get form values
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    // Prepare data to send
    const formData = new FormData();
    formData.append('mode', 'login');
    formData.append('Username', username);
    formData.append('Password', password);

    try {
        // Send POST request to PHP file
        const response = await fetch('connect.php', {
            method: 'POST',
            body: formData
        });

        // Get response text
        const result = await response.text();
        
        // Display result
        messageDiv.textContent = result;

        // Handle successful login
        if (result === "Login successful!") {
            // You can redirect or perform other actions here
            console.log('Login successful');
            // Example redirect:
            window.location.href = 'index.html';
        }

    } catch (error) {
        console.error('Error:', error);
        messageDiv.textContent = 'An error occurred. Please try again.';
    }
});

// Optional: Function to check if user is logged in (using session)
async function checkLoginStatus() {
    try {
        const response = await fetch('check_session.php', {
            method: 'GET',
            credentials: 'include' // Important for session cookies
        });
        const result = await response.json();
        return result.loggedIn;
    } catch (error) {
        console.error('Error checking login status:', error);
        return false;
    }
}