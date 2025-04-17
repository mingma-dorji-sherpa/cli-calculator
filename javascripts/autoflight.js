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

function getDayOfWeek(dateString) {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

// Set minimum date to current date and return date to next day when page loads
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  document.getElementById('depart-date').setAttribute('min', todayStr);
  document.getElementById('return-date').setAttribute('min', tomorrowStr);
});

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

  // Prepare the request data
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

  // Send request to backend
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
                  <p><strong>Amount:</strong> $${parseFloat(flight.amount).toFixed(2)}</p>
                  <button class="book-now" onclick="bookFlight(${flight.id}, ${passengers})">Book Now</button>
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

// Placeholder for bookFlight function (to be implemented with backend booking logic)
function bookFlight(flightId, passengers) {
  alert(`Booking flight ${flightId} for ${passengers} passengers. (Implement backend booking logic here)`);
  // Add your booking logic, e.g., send a request to connect.php with mode 'book_flight'
}