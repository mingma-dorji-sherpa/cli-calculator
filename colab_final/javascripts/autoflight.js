// Toggle return date field based on flight type
function toggleReturnDate() {
    const flightType = document.querySelector('input[name="flightType"]:checked').value;
    const returnDateField = document.getElementById('return-date');
    if (flightType === 'return') {
        returnDateField.style.display = 'block';
        returnDateField.setAttribute('required', true);
    } else {
        returnDateField.style.display = 'none';
        returnDateField.removeAttribute('required');
    }
}

// Get day of the week from a date string
function getDayOfWeek(dateString) {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Set minimum dates for departure and return
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    document.getElementById('depart-date').setAttribute('min', todayStr);
    document.getElementById('return-date').setAttribute('min', tomorrowStr);

    // Fetch locations dynamically
    fetch('http://localhost/Finalc/colab_final/connect.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: "get_locations" })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const fromSelect = document.getElementById('flight-from');
            const toSelect = document.getElementById('flight-to');
            fromSelect.innerHTML = '<option value="">Select Departure</option>';
            toSelect.innerHTML = '<option value="">Select Destination</option>';
            data.locations.forEach(location => {
                const optionFrom = document.createElement('option');
                optionFrom.value = location;
                optionFrom.textContent = location;
                fromSelect.appendChild(optionFrom);

                const optionTo = document.createElement('option');
                optionTo.value = location;
                optionTo.textContent = location;
                toSelect.appendChild(optionTo);
            });
        } else {
            console.error('Error fetching locations:', data.message);
        }
    })
    .catch(error => {
        console.error('Error fetching locations:', error);
        alert('Error loading locations. Please check your connection.');
    });

    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user')) || {};
    if (!user.username) {
        alert('Please log in to book flights.');
        window.location.href = 'login.html';
    } else {
        // Load user bookings if logged in
        loadUserBookings();
    }
});

// Search for flights
function searchFlights() {
    const flightType = document.querySelector('input[name="flightType"]:checked').value;
    const flightFrom = document.getElementById('flight-from').value.trim();
    const flightTo = document.getElementById('flight-to').value.trim();
    const departDate = document.getElementById('depart-date').value;
    let returnDate = document.getElementById('return-date').value;
    const passengers = parseInt(document.getElementById('passengers').value) || 1;

    // Validate inputs
    if (!flightFrom || !flightTo || !departDate) {
        alert('Please fill in all required fields.');
        return;
    }
    if (flightType === 'return' && !returnDate) {
        alert('Please select a return date for a return flight.');
        return;
    }
    if (passengers < 1 || passengers > 10) {
        alert('Number of passengers must be between 1 and 10.');
        return;
    }
    if (flightFrom === flightTo) {
        alert('Departure and destination cannot be the same.');
        return;
    }

    const mode = flightType === 'oneway' ? 'search_oneway_flights' : 'search_return_flights';
    const requestData = {
        mode: mode,
        flight_from: flightFrom,
        flight_to: flightTo,
        depart_date: departDate,
        passengers: passengers
    };
    if (flightType === 'return') {
        requestData.return_date = returnDate;
    }

    fetch('http://localhost/Finalc/colab_final/connect.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        const resultsBody = document.getElementById('flight-results-body');
        resultsBody.innerHTML = '';

        if (data.success && data.flights.length > 0) {
            data.flights.forEach(flight => {
                const flightCard = document.createElement('div');
                flightCard.className = 'flight-card';

                const departDay = getDayOfWeek(flight.depart_date);
                let flightDetails = `
                    <p><strong>From:</strong> ${flight.flight_from}</p>
                    <p><strong>To:</strong> ${flight.flight_to}</p>
                    <p><strong>Depart Date:</strong> ${flight.depart_date} (${departDay})</p>
                    <p><strong>Depart Time:</strong> ${flight.depart_time}</p>
                    <p><strong>Available Seats:</strong> ${flight.available_seats}</p>
                `;

                if (flightType === 'oneway') {
                    flightDetails += `<p><strong>Baggage Limit:</strong> ${flight.baggage_limit} kg</p>`;
                } else {
                    const returnDay = getDayOfWeek(flight.return_date);
                    flightDetails += `
                        <p><strong>Return Date:</strong> ${flight.return_date} (${returnDay})</p>
                        <p><strong>Return Time:</strong> ${flight.return_time}</p>
                        <p><strong>Baggage Weight:</strong> ${flight.baggage_weight} kg</p>
                    `;
                }

                flightDetails += `
                    <p><strong>Passengers:</strong> ${passengers}</p>
                    <p><strong>Amount:</strong> $${parseFloat(flight.amount).toFixed(2)} * ${passengers} = $${(parseFloat(flight.amount) * passengers).toFixed(2)}</p>
                    <button class="book-now" onclick="showPassengerForm(${flight.id}, ${passengers}, '${encodeURIComponent(JSON.stringify(flight))}', '${flightType}', '${flight.flight_from}', '${flight.flight_to}')">Book Now</button>
                `;
                flightCard.innerHTML = flightDetails;
                resultsBody.appendChild(flightCard);
            });
        } else {
            resultsBody.innerHTML = '<p>No matching flights found.</p>';
        }
    })
    .catch(error => {
        console.error('Error searching flights:', error);
        document.getElementById('flight-results-body').innerHTML = '<p>Error searching for flights. Please try again later.</p>';
    });
}

// Show passenger details form
function showPassengerForm(flightId, passengers, flightData, flightType, flightFrom, flightTo) {
    const flight = JSON.parse(decodeURIComponent(flightData));
    const modal = document.getElementById('booking-modal');
    const modalContent = document.getElementById('modal-content');
    let formHtml = `
        <h3>Passenger Details</h3>
        <form id="passenger-form">
    `;

    for (let i = 1; i <= passengers; i++) {
        formHtml += `
            <h4>Passenger ${i}</h4>
            <input type="text" id="full-name-${i}" placeholder="Full Name" required>
            <input type="text" id="passport-${i}" placeholder="Passport Number" required>
            <input type="tel" id="contact-${i}" placeholder="Contact Number" required>
        `;
    }

    formHtml += `
            <button type="button" onclick="submitPassengerDetails(${flightId}, ${passengers}, '${encodeURIComponent(JSON.stringify(flight))}', '${flightType}', '${flightFrom}', '${flightTo}')">Submit</button>
            <button type="button" onclick="closeModal()">Cancel</button>
        </form>
    `;

    modalContent.innerHTML = formHtml;
    modal.style.display = 'flex';
}

// Submit passenger details and confirm booking
function submitPassengerDetails(flightId, passengers, flightData, flightType, flightFrom, flightTo) {
    const flight = JSON.parse(decodeURIComponent(flightData));
    const passengerDetails = [];
    const user = JSON.parse(localStorage.getItem('user')) || {};

    if (!user.username) {
        alert('Please log in to book flights.');
        window.location.href = 'login.html';
        return;
    }

    for (let i = 1; i <= passengers; i++) {
        const fullName = document.getElementById(`full-name-${i}`).value.trim();
        const passport = document.getElementById(`passport-${i}`).value.trim();
        const contact = document.getElementById(`contact-${i}`).value.trim();
    
        if (!fullName || !passport || !contact) {
            alert(`Please fill in all details for Passenger ${i}.`);
            return;
        }

        // ✅ Full name validation: letters and spaces only
        const fullNameRegex = /^[A-Za-z\s]+$/;
        if (!fullNameRegex.test(fullName)) {
            alert(`Full name for Passenger ${i} must contain only letters and spaces.`);
            return;
        }

        // Validate passport: 2 uppercase letters followed by 6 digits
        const passportRegex = /^[A-Z]{2}\d{6}$/;
        if (!passportRegex.test(passport)) {
            alert(`Passport number for Passenger ${i} must start with 2 uppercase letters followed by 6 digits (e.g., AB123456).`);
            return;
        }
    
        // Validate contact number: must start with + and followed by 10–14 digits
        const contactRegex = /^\+\d{10,14}$/;
        if (!contactRegex.test(contact)) {
            alert(`Contact number for Passenger ${i} must start with '+' and contain 10 to 14 digits (e.g., +9779812345678).`);
            return;
        }
    
        passengerDetails.push({ fullName, passport, contact });
    }
    

    const requestData = {
        mode: 'book_flight',
        flight_id: flightId,
        passengers: passengers,
        passenger_details: passengerDetails,
        flight_type: flightType,
        username: user.username,
        flighttype: `${flightFrom} to ${flightTo}`
    };

    fetch('http://localhost/Finalc/colab_final/connect.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP error ${response.status}: ${text}`);
            });
        }
        return response.text(); // Get raw text first
    })
    .then(text => {
        try {
            const data = JSON.parse(text);
            if (data.success) {
                alert('Booking successful!');
                showTicket(flight, passengerDetails, passengers, flightType, data.booking_id);
                addToActivityLog(flight, passengerDetails, passengers, flightType, data.booking_id);
                loadUserBookings();
                closeModal();
            } else {
                alert('Error booking flight: ' + data.message);
            }
        } catch (e) {
            console.error('JSON parse error:', e);
            console.error('Raw response:', text);
            alert('Thank you for booking a flight with us.');
            // showTicket(flight, passengerDetails, passengers, flightType, data.booking_id);
            // addToActivityLog(flight, passengerDetails, passengers, flightType, data.booking_id);
            loadUserBookings();
            closeModal();
        }
    })
    .catch(error => {
        console.error('Error booking flight:', error);
        alert('Error booking flight: ' + error.message);
    });
}

//Show Ticket
function downloadTicket(flightData, passengerDetailsData, passengers, flightType, bookingId) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const flight = JSON.parse(decodeURIComponent(flightData));
    const passengerDetails = JSON.parse(decodeURIComponent(passengerDetailsData));
    const departDay = getDayOfWeek(flight.depart_date);

    // Draw watermark
    doc.setFontSize(80);
    doc.setTextColor(200, 200, 200); // light gray
    doc.text('AirWings', 80, 120, { angle: 45 });

    let y = 20;

    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AirWings Flight Ticket', 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    // Booking Info
    doc.text(`Booking ID: ${bookingId}`, 20, y);
    y += 10;
    doc.text(`From: ${flight.flight_from}`, 20, y);
    y += 10;
    doc.text(`To: ${flight.flight_to}`, 20, y);
    y += 10;
    doc.text(`Depart Date: ${flight.depart_date} (${departDay})`, 20, y);
    y += 10;
    doc.text(`Depart Time: ${flight.depart_time}`, 20, y);
    y += 10;

    if (flightType === 'oneway') {
        doc.text(`Baggage Limit: ${flight.baggage_limit} kg`, 20, y);
        y += 10;
    } else {
        const returnDay = getDayOfWeek(flight.return_date);
        doc.text(`Return Date: ${flight.return_date} (${returnDay})`, 20, y);
        y += 10;
        doc.text(`Return Time: ${flight.return_time}`, 20, y);
        y += 10;
        doc.text(`Baggage Weight: ${flight.baggage_weight} kg`, 20, y);
        y += 10;
    }

    doc.text(`Passengers: ${passengers}`, 20, y);
    y += 10;

    const total = (parseFloat(flight.amount) * passengers).toFixed(2);
    const singleAmount = parseFloat(flight.amount).toFixed(2);
    doc.text(`Amount: $${singleAmount} × ${passengers} = $${total}`, 20, y);
    y += 15;

    // Passenger details header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Passenger Details:', 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    passengerDetails.forEach((passenger, index) => {
        doc.text(`Passenger ${index + 1}:`, 20, y);
        y += 8;
        doc.text(`• Full Name: ${passenger.fullName}`, 25, y);
        y += 7;
        doc.text(`• Passport: ${passenger.passport}`, 25, y);
        y += 7;
        doc.text(`• Contact: ${passenger.contact}`, 25, y);
        y += 10;

        if (y >= 270) { // Prevent overflow
            doc.addPage();
            y = 20;
        }
    });

    // Use passenger name for filename
    let passengerName = passengerDetails[0]?.fullName || 'Ticket';
    passengerName = passengerName.replace(/\s+/g, ''); // remove spaces

    doc.save(`AirWings_Ticket_${passengerName}.pdf`);
}

// Add booking to activity log
function addToActivityLog(flight, passengerDetails, passengers, flightType, bookingId) {
    const activityList = document.getElementById('activity-list');
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';

    const bookingDate = new Date().toLocaleString();
    let activityHtml = `
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Booked on:</strong> ${bookingDate}</p>
        <p><strong>From:</strong> ${flight.flight_from}</p>
        <p><strong>To:</strong> ${flight.flight_to}</p>
        <p><strong>Depart Date:</strong> ${flight.depart_date}</p>
        <p><strong>Flight Type:</strong> ${flightType}</p>
        <p><strong>Passengers:</strong> ${passengers}</p>
        <p><strong>Passenger Names:</strong> ${passengerDetails.map(p => p.fullName).join(', ')}</p>
        <button onclick="cancelBooking(${bookingId}, ${flight.id}, '${flightType}', ${passengers})">Cancel Booking</button>
        <button onclick="downloadTicket('${encodeURIComponent(JSON.stringify(flight))}', '${encodeURIComponent(JSON.stringify(passengerDetails))}', ${passengers}, '${flightType}', ${bookingId})">Download Ticket</button>
    `;

    activityItem.innerHTML = activityHtml;
    activityList.prepend(activityItem);
}

// Load user bookings
function loadUserBookings() {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const activityList = document.getElementById('activity-list');
    
    if (!user.username) {
        activityList.innerHTML = '<p>Please log in to view your bookings.</p>';
        return;
    }

    fetch('http://localhost/Finalc/colab_final/connect.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'get_booking_history', username: user.username })
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP error ${response.status}: ${text}`);
            });
        }
        return response.text(); // Get raw text first to debug JSON issues
    })
    .then(text => {
        try {
            const data = JSON.parse(text);
            activityList.innerHTML = '';
            if (data.success && data.bookings && data.bookings.length > 0) {
                let hasActiveBookings = false; // Track if there are any non-cancelled bookings
                data.bookings.forEach(booking => {
                    if (booking.user === user.username && booking.status !== 'Cancelled') { // Only show non-cancelled bookings
                        hasActiveBookings = true;
                        const activityItem = document.createElement('div');
                        activityItem.className = 'activity-item';
                        activityItem.setAttribute('data-booking-id', booking.id); // Add booking ID as a data attribute
                        // Use passenger_details directly since it's already an array from the server
                        const passengerDetails = booking.passenger_details || [];
                        const passengerNames = passengerDetails.map(p => p.fullName).join(', ') || 'N/A';
                        let activityHtml = `
                            <p><strong>Booking ID:</strong> ${booking.id}</p>
                            <p><strong>Booked on:</strong> ${booking.booking_date}</p>
                            <p><strong>From:</strong> ${booking.flight ? booking.flight.flight_from : 'N/A'}</p>
                            <p><strong>To:</strong> ${booking.flight ? booking.flight.flight_to : 'N/A'}</p>
                            <p><strong>Depart Date:</strong> ${booking.flight ? booking.flight.depart_date : 'N/A'}</p>
                            <p><strong>Flight Type:</strong> ${booking.flight_type}</p>
                            <p><strong>Passengers:</strong> ${booking.seats_booked}</p>
                            <p><strong>Passenger Names:</strong> ${passengerNames}</p>
                            <p><strong>Status:</strong> ${booking.status}</p>
                            <p><strong>Flight Route:</strong> ${booking.flighttype}</p>
                        `;
                        if (booking.status !== 'Cancelled') {
                            activityHtml += `<button id="cancelbtn" onclick="cancelBooking(${booking.id}, ${booking.flight_id}, '${booking.flight_type}', ${booking.seats_booked})">Cancel Booking</button>`;
                        }
                        activityHtml += `
                            <button id="dwnbtn" onclick="downloadTicket('${encodeURIComponent(JSON.stringify(booking.flight || {}))}', '${encodeURIComponent(JSON.stringify(passengerDetails))}', ${booking.seats_booked}, '${booking.flight_type}', ${booking.id})">Download Ticket</button>
                        `;
                        activityItem.innerHTML = activityHtml;
                        activityList.appendChild(activityItem);
                    }
                });
                if (!hasActiveBookings) { // If no non-cancelled bookings are found
                    activityList.innerHTML = '<p>No active bookings found.</p>';
                }
            } else {
                activityList.innerHTML = '<p>No active bookings found.</p>';
            }
        } catch (e) {
            console.error('JSON parse error in loadUserBookings:', e);
            console.error('Raw response:', text);
            activityList.innerHTML = '<p>Error loading bookings. Invalid server response. Please try again later.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading booking history:', error);
        activityList.innerHTML = `<p>Error loading bookings: ${error.message}. Please try again later.</p>`;
    });
}

// Cancel booking
function cancelBooking(bookingId, flightId, flightType, seatsBooked) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        fetch('http://localhost/Finalc/colab_final/connect.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: 'cancel_booking',
                booking_id: bookingId,
                flight_id: flightId,
                flight_type: flightType,
                seats_booked: seatsBooked
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Booking cancelled successfully!');
                // Remove the specific booking from the activity panel
                const activityItem = document.querySelector(`.activity-item[data-booking-id="${bookingId}"]`);
                if (activityItem) {
                    activityItem.remove();
                }
                // Check if there are any remaining bookings; if not, show "No bookings found"
                const activityList = document.getElementById('activity-list');
                if (!activityList.querySelector('.activity-item')) {
                    activityList.innerHTML = '<p>No active bookings found.</p>';
                }
                // Optionally reload bookings to ensure sync with backend
                loadUserBookings();
            } else {
                alert('Error cancelling booking: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error cancelling booking:', error);
            alert('Error cancelling booking. Please try again later.');
        });
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('booking-modal');
    modal.style.display = 'none';
}