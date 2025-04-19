document.addEventListener("DOMContentLoaded", function () {
    let today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    document.getElementById("departDate").setAttribute("min", today);
    document.getElementById("returnDate").setAttribute("min", today);
});

function validateDates() {
    let departDate = document.getElementById("departDate").value;
    let returnDate = document.getElementById("returnDate").value;
    let departError = document.getElementById("departError");
    let returnError = document.getElementById("returnError");

    let today = new Date().toISOString().split("T")[0]; // Get today's date

    // Reset error messages
    departError.style.display = "none";
    returnError.style.display = "none";

    if (!departDate) {
        departError.textContent = "Please select a departure date.";
        departError.style.display = "block";
        return;
    }

    if (departDate < today) {
        departError.textContent = "Departure date cannot be in the past.";
        departError.style.display = "block";
        return;
    }

    if (returnDate) {
        if (returnDate < departDate) {
            returnError.textContent = "Return date cannot be before departure date.";
            returnError.style.display = "block";
            return;
        }
    }

    // Set return date's min to departure date to prevent invalid selection
    document.getElementById("returnDate").setAttribute("min", departDate);

    alert("Dates are valid! Proceeding with search...");
}

document.getElementById("passengerCount").addEventListener("input", function () {
    let passengerInput = document.getElementById("passengerCount");
    let passengerError = document.getElementById("passengerError");

    if (passengerInput.value > 5) {
        passengerInput.value = 5; // Reset to max value
        passengerError.textContent = "The number of passengers must not exceed 5.";
        passengerError.style.display = "block";
    } else {
        passengerError.style.display = "none";
    }
});
//end


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

//start
//explore more
// document.addEventListener("DOMContentLoaded", function () {
//     let toggleButton = document.getElementById("toggleButton");
//     let hotellSection = document.getElementById("hotells");
//     let uniqueSection = document.getElementById("uniquee");

//     if (toggleButton) {
//         toggleButton.addEventListener("click", function () {
//             console.log("Button clicked!"); // Debugging

//             hotellSection.classList.toggle("show");
//             uniqueSection.classList.toggle("show");
//         });
//     } else {
//         console.error("Button not found!");
//     }
// });





// end