//booking stays
document.addEventListener("DOMContentLoaded", function () {
    let today = new Date().toISOString().split("T")[0];

    // Disable past dates in input fields
    document.getElementById("checkin").setAttribute("min", today);
    document.getElementById("checkout").setAttribute("min", today);

    document.getElementById("booking-form").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent form submission

        let checkinInput = document.getElementById("checkin");
        let checkoutInput = document.getElementById("checkout");
        let rooms = document.getElementById("rooms").value;
        let guests = document.getElementById("guests").value;
        let roomType = document.getElementById("room-type").value;
        let errorMessage = document.getElementById("error-message");

        let checkin = new Date(checkinInput.value);
        let checkout = new Date(checkoutInput.value);
        let todayDate = new Date();

        // Validation: Check if fields are empty
        if (!checkinInput.value || !checkoutInput.value || !rooms || !guests || !roomType) {
            errorMessage.textContent = "Please fill up the required form.";
            return;
        } else {
            errorMessage.textContent = "";
        }

        // Validation: Prevent past dates
        if (checkin < todayDate || checkout < todayDate) {
            alert("Cannot enter past date.");
            return;
        }

        // Validation: Check-in date must be before check-out
        if (checkin >= checkout) {
            errorMessage.textContent = "Check-out date must be after check-in date.";
            return;
        }

        // Calculate number of nights
        let nights = (checkout - checkin) / (1000 * 60 * 60 * 24);

        // Calculate total price
        let totalPrice = nights * roomType * rooms;
        document.getElementById("total-price").textContent = `$${totalPrice}`;

        // Show availability message
        document.getElementById("availability-msg").textContent = "Rooms are available! Proceed to booking.";
        document.getElementById("availability-msg").style.color = "green";
    });
});


//reviews
document.addEventListener("DOMContentLoaded", function () {
    const reviewsContainer = document.getElementById("reviews-container");
    const submitButton = document.getElementById("submit-review");
    const errorMessage = document.getElementById("error-message");

    submitButton.addEventListener("click", function () {
        let username = document.getElementById("username").value.trim();
        let reviewText = document.getElementById("user-review").value.trim();
        let rating = document.getElementById("user-rating").value;

        // Validate input
        if (username === "" || reviewText === "") {
            errorMessage.textContent = "Please fill in all fields.";
            return;
        } else {
            errorMessage.textContent = "";
        }

        // Create new review element
        let newReview = document.createElement("div");
        newReview.classList.add("review");

        let profileImage = document.createElement("img");
        profileImage.src = "default-profile.jpg"; // Default profile image
        profileImage.alt = username;

        let reviewContent = document.createElement("div");
        reviewContent.classList.add("review-content");

        let nameElement = document.createElement("h4");
        nameElement.textContent = username;

        let reviewTextElement = document.createElement("p");
        reviewTextElement.textContent = `"${reviewText}"`;

        let starsElement = document.createElement("div");
        starsElement.classList.add("stars");
        starsElement.innerHTML = "⭐".repeat(rating);

        // Append elements
        reviewContent.appendChild(nameElement);
        reviewContent.appendChild(reviewTextElement);
        reviewContent.appendChild(starsElement);
        newReview.appendChild(profileImage);
        newReview.appendChild(reviewContent);
        reviewsContainer.appendChild(newReview);

        // Clear form
        document.getElementById("username").value = "";
        document.getElementById("user-review").value = "";
    });

});

