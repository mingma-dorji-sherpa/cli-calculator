document.addEventListener("DOMContentLoaded", function () {
  // Set the minimum date for departure date inputs to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('oneway-depart-date').setAttribute('min', today);
  document.getElementById('return-depart-date').setAttribute('min', today);
  document.getElementById('return-return-date').setAttribute('min', today);

  // Function to fetch and display total bookings
  function fetchTotalBookings() {
      fetch('http://localhost/Finalc/colab_final/connect.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: "get_total_bookings" })
      })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  document.getElementById('total-bookings').textContent = data.total;
              } else {
                  console.error('Error fetching total bookings:', data.message);
              }
          })
          .catch(error => console.error('Error fetching total bookings:', error));
  }

  // Function to fetch and display today's bookings
  function fetchTodaysBookings() {
      fetch('http://localhost/Finalc/colab_final/connect.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: "get_todays_bookings" })
      })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  document.getElementById('todays-bookings').textContent = data.total;
              } else {
                  console.error('Error fetching today\'s bookings:', data.message);
              }
          })
          .catch(error => console.error('Error fetching today\'s bookings:', error));
  }

  // Function to fetch and display pending requests
  function fetchPendingRequests() {
      fetch('http://localhost/Finalc/colab_final/connect.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: "get_pending_requests" })
      })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  document.getElementById('pending-requests').textContent = data.total;
              } else {
                  console.error('Error fetching pending requests:', data.message);
              }
          })
          .catch(error => console.error('Error fetching pending requests:', error));
  }

  // Function to fetch and display today's messages
  function fetchTodaysMessages() {
      fetch('http://localhost/Finalc/colab_final/contact.php', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
      })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok: ' + response.statusText);
              }
              return response.json();
          })
          .then(data => {
              if (data.success) {
                  const today = new Date().toISOString().split('T')[0];
                  const todaysMessages = data.messages.filter(message => {
                      if (!message.created_at) return false;
                      const messageDate = new Date(message.created_at).toISOString().split('T')[0];
                      return messageDate === today;
                  });
                  document.getElementById('todays-message').textContent = todaysMessages.length;
              } else {
                  console.error('Error fetching today\'s messages:', data.message);
              }
          })
          .catch(error => console.error('Error fetching today\'s messages:', error));
  }

  // Function to fetch and display total registered users
  function fetchRegisteredUsers() {
      fetch('http://localhost/Finalc/colab_final/connect.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: "get_registered_users" })
      })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  document.getElementById('registered-users').textContent = data.total;
              } else {
                  console.error('Error fetching registered users:', data.message);
              }
          })
          .catch(error => console.error('Error fetching registered users:', error));
  }

  // Function to fetch and display today's registered users
  function fetchTodaysUsers() {
      fetch('http://localhost/Finalc/colab_final/connect.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: "get_todays_users" })
      })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  document.getElementById('todays-users').textContent = data.total;
              } else {
                  console.error('Error fetching today\'s users:', data.message);
              }
          })
          .catch(error => console.error('Error fetching today\'s users:', error));
  }

  // Function to fetch and display total revenue
  function fetchTotalRevenue() {
      fetch('http://localhost/Finalc/colab_final/connect.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: "get_total_revenue" })
      })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  document.getElementById('total-revenue').textContent = '$' + data.total.toFixed(2);
              } else {
                  console.error('Error fetching total revenue:', data.message);
              }
          })
          .catch(error => console.error('Error fetching total revenue:', error));
  }

  // Function to fetch and display today's revenue
  function fetchTodaysRevenue() {
      fetch('http://localhost/Finalc/colab_final/connect.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: "get_todays_revenue" })
      })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  document.getElementById('todays-revenue').textContent = '$' + data.total.toFixed(2);
              } else {
                  console.error('Error fetching today\'s revenue:', data.message);
              }
          })
          .catch(error => console.error('Error fetching today\'s revenue:', error));
  }

  // Function to fetch and display all users
  function fetchUsers() {
      fetch('http://localhost/Finalc/colab_final/connect.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: "get_all_users" })
      })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  const usersTableBody = document.querySelector('#users-table tbody');
                  usersTableBody.innerHTML = '';
                  data.users.forEach(user => {
                      const row = document.createElement('tr');
                      row.innerHTML = `
                          <td>${user.username}</td>
                          <td>${user.email}</td>
                          <td>${user.provider}</td>
                          <td>${new Date(user.created_at).toLocaleString()}</td>
                          <td class="action">
                              <a href="#" class="edit-user" data-username="${user.username}" data-email="${user.email}">Edit</a>
                              <a href="#" class="delete-user" data-username="${user.username}">Delete</a>
                          </td>
                      `;
                      usersTableBody.appendChild(row);
                  });

                  document.querySelectorAll('.edit-user').forEach(link => {
                      link.addEventListener('click', function (e) {
                          e.preventDefault();
                          const username = this.getAttribute('data-username');
                          const currentEmail = this.getAttribute('data-email');
                          const newEmail = prompt('Enter new email for user ' + username + ':', currentEmail);
                          if (newEmail && newEmail !== currentEmail) {
                              fetch('http://localhost/Finalc/colab_final/connect.php', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ mode: "edit_user", username: username, email: newEmail })
                              })
                                  .then(response => response.json())
                                  .then(data => {
                                      if (data.success) {
                                          alert('User email updated successfully');
                                          fetchUsers();
                                      } else {
                                          alert('Error: ' + data.message);
                                      }
                                  })
                                  .catch(error => console.error('Error editing user:', error));
                          }
                      });
                  });

                  document.querySelectorAll('.delete-user').forEach(link => {
                      link.addEventListener('click', function (e) {
                          e.preventDefault();
                          const username = this.getAttribute('data-username');
                          if (confirm('Are you sure you want to delete user ' + username + '?')) {
                              fetch('http://localhost/Finalc/colab_final/connect.php', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ mode: "delete_user", username: username })
                              })
                                  .then(response => response.json())
                                  .then(data => {
                                      if (data.success) {
                                          alert('User deleted successfully');
                                          fetchUsers();
                                          fetchRegisteredUsers();
                                          fetchTodaysUsers();
                                      } else {
                                          alert('Error: ' + data.message);
                                      }
                                  })
                                  .catch(error => console.error('Error deleting user:', error));
                          }
                      });
                  });
              } else {
                  console.error('Error fetching users:', data.message);
              }
          })
          .catch(error => console.error('Error fetching users:', error));
  }

  // Function to fetch and display contact messages
  function fetchContactMessages() {
      fetch('http://localhost/Finalc/colab_final/contact.php', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
      })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok: ' + response.statusText);
              }
              return response.json();
          })
          .then(data => {
              if (data.success) {
                  const messagesTableBody = document.querySelector('#messages-table tbody');
                  messagesTableBody.innerHTML = '';

                  const removedMessages = JSON.parse(localStorage.getItem('removedMessages') || '[]');

                  if (data.messages.length === 0) {
                      messagesTableBody.innerHTML = '<tr><td colspan="6">No messages found</td></tr>';
                  } else {
                      data.messages.forEach(message => {
                          if (removedMessages.includes(message.id)) {
                              return;
                          }

                          const row = document.createElement('tr');
                          row.innerHTML = `
                              <td>${message.name || 'N/A'}</td>
                              <td>${message.email || 'N/A'}</td>
                              <td>${message.countrycode ? message.countrycode + ' ' : ''}${message.phone || 'N/A'}</td>
                              <td>${message.message || 'N/A'}</td>
                              <td>${message.created_at ? new Date(message.created_at).toLocaleString() : 'N/A'}</td>
                              <td class="action">
                                  <a href="#" class="remove-message" data-id="${message.id}">Remove</a>
                              </td>
                          `;
                          messagesTableBody.appendChild(row);
                      });

                      document.querySelectorAll('.remove-message').forEach(link => {
                          link.addEventListener('click', function (e) {
                              e.preventDefault();
                              const messageId = this.getAttribute('data-id');
                              removedMessages.push(messageId);
                              localStorage.setItem('removedMessages', JSON.stringify(removedMessages));
                              fetchContactMessages();
                          });
                      });
                  }
              } else {
                  console.error('Error fetching contact messages:', data.message);
                  messagesTableBody.innerHTML = '<tr><td colspan="6">Error: ' + data.message + '</td></tr>';
              }
          })
          .catch(error => {
              console.error('Error fetching contact messages:');
              document.querySelector('#messages-table tbody').innerHTML = '<tr><td colspan="6">Error fetching messages: ' + error.message + '</td></tr>';
          });
  }

  // Function to fetch and display recent bookings
  function fetchRecentBookings() {
      fetch('http://localhost/Finalc/colab_final/connect.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: "get_recent_bookings" })
      })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  const bookingsTableBody = document.querySelector('#bookings-table tbody');
                  bookingsTableBody.innerHTML = '';
                  if (data.bookings.length === 0) {
                      bookingsTableBody.innerHTML = '<tr><td colspan="7">No bookings found</td></tr>';
                  } else {
                      data.bookings.forEach(booking => {
                          const row = document.createElement('tr');
                          row.innerHTML = `
                              <td>${booking.id}</td>
                              <td>${booking.user}</td>
                              <td>${booking.airlines}</td>
                              <td>$${parseFloat(booking.amount).toFixed(2)}</td>
                              <td>${booking.booking_date}</td>
                              <td>${booking.status}</td>
                              <td class="action">
                                  <a href="#" class="view-booking" data-id="${booking.id}">View</a>
                                  <a href="#" class="cancel-booking" data-id="${booking.id}" data-flight-id="${booking.flight_id}" data-flight-type="${booking.flight_type}" data-seats-booked="${booking.seats_booked}">Cancel</a>
                              </td>
                          `;
                          bookingsTableBody.appendChild(row);
                      });

                      document.querySelectorAll('.view-booking').forEach(link => {
                          link.addEventListener('click', function (e) {
                              e.preventDefault();
                              const bookingId = this.getAttribute('data-id');
                              fetch('http://localhost/Finalc/colab_final/connect.php', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ mode: "view_booking", booking_id: bookingId })
                              })
                                  .then(response => response.json())
                                  .then(data => {
                                      if (data.success) {
                                          const booking = data.booking;
                                          alert(`
                                              Booking Details:
                                              ID: ${booking.id}
                                              User: ${booking.user}
                                              Airlines: ${booking.airlines}
                                              Amount: $${parseFloat(booking.amount).toFixed(2)}
                                              Date: ${booking.booking_date}
                                              Status: ${booking.status}
                                              Created At: ${new Date(booking.created_at).toLocaleString()}
                                          `);
                                      } else {
                                          alert('Error: ' + data.message);
                                      }
                                  })
                                  .catch(error => console.error('Error viewing booking:', error));
                          });
                      });

                      document.querySelectorAll('.cancel-booking').forEach(link => {
                          link.addEventListener('click', function (e) {
                              e.preventDefault();
                              const bookingId = this.getAttribute('data-id');
                              const flightId = this.getAttribute('data-flight-id');
                              const flightType = this.getAttribute('data-flight-type');
                              const seatsBooked = parseInt(this.getAttribute('data-seats-booked'));

                              if (confirm('Are you sure you want to cancel booking ID ' + bookingId + '?')) {
                                  fetch('http://localhost/Finalc/colab_final/connect.php', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                          mode: "cancel_booking",
                                          booking_id: bookingId,
                                          flight_id: flightId,
                                          flight_type: flightType,
                                          seats_booked: seatsBooked
                                      })
                                  })
                                      .then(response => response.json())
                                      .then(data => {
                                          if (data.success) {
                                              alert('Booking cancelled successfully');
                                              fetchRecentBookings();
                                              fetchTotalBookings();
                                              fetchTodaysBookings();
                                              fetchTotalRevenue();
                                              fetchTodaysRevenue();
                                              if (flightType === 'oneway') {
                                                  fetchOnewayFlights();
                                              } else if (flightType === 'return') {
                                                  fetchReturnFlights();
                                              }
                                          } else {
                                              alert('Error: ' + data.message);
                                          }
                                      })
                                      .catch(error => console.error('Error cancelling booking:', error));
                              }
                          });
                      });
                  }
              } else {
                  console.error('Error fetching recent bookings:', data.message);
              }
          })
          .catch(error => console.error('Error fetching recent bookings:', error));
  }

  // Function to fetch and display one-way flights
  function fetchOnewayFlights() {
      fetch('http://localhost/Finalc/colab_final/connect.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: "get_oneway_flights" })
      })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  const flightsTableBody = document.querySelector('#oneway-flights-table tbody');
                  flightsTableBody.innerHTML = '';
                  if (data.flights.length === 0) {
                      flightsTableBody.innerHTML = '<tr><td colspan="9">No one-way flights found</td></tr>';
                  } else {
                      data.flights.forEach(flight => {
                          const row = document.createElement('tr');
                          row.innerHTML = `
                              <td>${flight.id}</td>
                              <td>${flight.flight_from}</td>
                              <td>${flight.flight_to}</td>
                              <td>${flight.depart_date}</td>
                              <td>${flight.depart_time}</td>
                              <td>${flight.available_seats}</td>
                              <td>${flight.baggage_limit}</td>
                              <td>$${parseFloat(flight.amount).toFixed(2)}</td>
                              <td class="action">
                                  <a href="#" class="edit-oneway-flight" data-id="${flight.id}" data-flight_from="${flight.flight_from}" data-flight_to="${flight.flight_to}" data-depart_date="${flight.depart_date}" data-depart_time="${flight.depart_time}" data-available_seats="${flight.available_seats}" data-baggage_limit="${flight.baggage_limit}" data-amount="${flight.amount}">Edit</a>
                                  <a href="#" class="delete-oneway-flight" data-id="${flight.id}">Delete</a>
                              </td>
                          `;
                          flightsTableBody.appendChild(row);
                      });

                      document.querySelectorAll('.edit-oneway-flight').forEach(link => {
                          link.addEventListener('click', function (e) {
                              e.preventDefault();
                              const flightId = this.getAttribute('data-id');
                              const flightFrom = this.getAttribute('data-flight_from');
                              const flightTo = this.getAttribute('data-flight_to');
                              const departDate = this.getAttribute('data-depart_date');
                              const departTime = this.getAttribute('data-depart_time');
                              const availableSeats = this.getAttribute('data-available_seats');
                              const baggageLimit = this.getAttribute('data-baggage_limit');
                              const amount = this.getAttribute('data-amount');

                              const dialog = document.getElementById('oneway-flight-dialog');
                              document.getElementById('oneway-dialog-title').textContent = 'Edit One-Way Flight';
                              document.getElementById('oneway-flight-id').value = flightId;
                              document.getElementById('oneway-flight-from').value = flightFrom;
                              document.getElementById('oneway-flight-to').value = flightTo;
                              document.getElementById('oneway-depart-date').value = departDate;
                              document.getElementById('oneway-depart-time').value = departTime;
                              document.getElementById('oneway-available-seats').value = availableSeats;
                              document.getElementById('oneway-baggage-limit').value = baggageLimit;
                              document.getElementById('oneway-amount').value = amount;

                              dialog.showModal();
                          });
                      });

                      document.querySelectorAll('.delete-oneway-flight').forEach(link => {
                          link.addEventListener('click', function (e) {
                              e.preventDefault();
                              const flightId = this.getAttribute('data-id');
                              if (confirm('Are you sure you want to delete one-way flight ID ' + flightId + '?')) {
                                  fetch('http://localhost/Finalc/colab_final/connect.php', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ mode: "delete_oneway_flight", flight_id: flightId })
                                  })
                                      .then(response => response.json())
                                      .then(data => {
                                          if (data.success) {
                                              alert('One-way flight deleted successfully');
                                              fetchOnewayFlights();
                                          } else {
                                              alert('Error: ' + data.message);
                                          }
                                      })
                                      .catch(error => console.error('Error deleting one-way flight:', error));
                              }
                          });
                      });
                  }
              } else {
                  console.error('Error fetching one-way flights:', data.message);
              }
          })
          .catch(error => console.error('Error fetching one-way flights:', error));
  }

  // Function to fetch and display return flights
  function fetchReturnFlights() {
      fetch('http://localhost/Finalc/colab_final/connect.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: "get_return_flights" })
      })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  const flightsTableBody = document.querySelector('#return-flights-table tbody');
                  flightsTableBody.innerHTML = '';
                  if (data.flights.length === 0) {
                      flightsTableBody.innerHTML = '<tr><td colspan="11">No return flights found</td></tr>';
                  } else {
                      data.flights.forEach(flight => {
                          const row = document.createElement('tr');
                          row.innerHTML = `
                              <td>${flight.id}</td>
                              <td>${flight.flight_from}</td>
                              <td>${flight.flight_to}</td>
                              <td>${flight.depart_date}</td>
                              <td>${flight.return_date}</td>
                              <td>${flight.depart_time}</td>
                              <td>${flight.return_time}</td>
                              <td>${flight.available_seats}</td>
                              <td>${flight.baggage_weight}</td>
                              <td>$${parseFloat(flight.amount).toFixed(2)}</td>
                              <td class="action">
                                  <a href="#" class="edit-return-flight" data-id="${flight.id}" data-flight_from="${flight.flight_from}" data-flight_to="${flight.flight_to}" data-depart_date="${flight.depart_date}" data-return_date="${flight.return_date}" data-depart_time="${flight.depart_time}" data-return_time="${flight.return_time}" data-available_seats="${flight.available_seats}" data-baggage_weight="${flight.baggage_weight}" data-amount="${flight.amount}">Edit</a>
                                  <a href="#" class="delete-return-flight" data-id="${flight.id}">Delete</a>
                              </td>
                          `;
                          flightsTableBody.appendChild(row);
                      });

                      document.querySelectorAll('.edit-return-flight').forEach(link => {
                          link.addEventListener('click', function (e) {
                              e.preventDefault();
                              const flightId = this.getAttribute('data-id');
                              const flightFrom = this.getAttribute('data-flight_from');
                              const flightTo = this.getAttribute('data-flight_to');
                              const departDate = this.getAttribute('data-depart_date');
                              const returnDate = this.getAttribute('data-return_date');
                              const departTime = this.getAttribute('data-depart_time');
                              const returnTime = this.getAttribute('data-return_time');
                              const availableSeats = this.getAttribute('data-available_seats');
                              const baggageWeight = this.getAttribute('data-baggage_weight');
                              const amount = this.getAttribute('data-amount');

                              const dialog = document.getElementById('return-flight-dialog');
                              document.getElementById('return-dialog-title').textContent = 'Edit Return Flight';
                              document.getElementById('return-flight-id').value = flightId;
                              document.getElementById('return-flight-from').value = flightFrom;
                              document.getElementById('return-flight-to').value = flightTo;
                              document.getElementById('return-depart-date').value = departDate;
                              document.getElementById('return-return-date').value = returnDate;
                              document.getElementById('return-depart-time').value = departTime;
                              document.getElementById('return-return-time').value = returnTime;
                              document.getElementById('return-available-seats').value = availableSeats;
                              document.getElementById('return-baggage-weight').value = baggageWeight;
                              document.getElementById('return-amount').value = amount;

                              dialog.showModal();
                          });
                      });

                      document.querySelectorAll('.delete-return-flight').forEach(link => {
                          link.addEventListener('click', function (e) {
                              e.preventDefault();
                              const flightId = this.getAttribute('data-id');
                              if (confirm('Are you sure you want to delete return flight ID ' + flightId + '?')) {
                                  fetch('http://localhost/Finalc/colab_final/connect.php', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ mode: "delete_return_flight", flight_id: flightId })
                                  })
                                      .then(response => response.json())
                                      .then(data => {
                                          if (data.success) {
                                              alert('Return flight deleted successfully');
                                              fetchReturnFlights();
                                          } else {
                                              alert('Error: ' + data.message);
                                          }
                                      })
                                      .catch(error => console.error('Error deleting return flight:', error));
                              }
                          });
                      });
                  }
              } else {
                  console.error('Error fetching return flights:', data.message);
              }
          })
          .catch(error => console.error('Error fetching return flights:', error));
  }

  // Handle adding/editing one-way flights
  const onewayFlightDialog = document.getElementById('oneway-flight-dialog');
  const onewayFlightForm = document.getElementById('oneway-flight-form');
  const addOnewayFlightBtn = document.getElementById('add-oneway-flight-btn');
  const onewayCancelBtn = document.getElementById('oneway-cancel-btn');

  addOnewayFlightBtn.addEventListener('click', () => {
      document.getElementById('oneway-dialog-title').textContent = 'Add One-Way Flight';
      onewayFlightForm.reset();
      document.getElementById('oneway-flight-id').value = '';
      onewayFlightDialog.showModal();
  });

  onewayCancelBtn.addEventListener('click', () => {
      onewayFlightDialog.close();
  });

  onewayFlightForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const flightId = document.getElementById('oneway-flight-id').value;
      const flightFrom = document.getElementById('oneway-flight-from').value;
      const flightTo = document.getElementById('oneway-flight-to').value;
      const departDate = document.getElementById('oneway-depart-date').value;
      const departTime = document.getElementById('oneway-depart-time').value;
      const availableSeats = parseInt(document.getElementById('oneway-available-seats').value);
      const baggageLimit = parseInt(document.getElementById('oneway-baggage-limit').value);
      const amount = parseFloat(document.getElementById('oneway-amount').value) || 0.00;

      // Validate departure date
      const currentDate = new Date(today);
      const selectedDate = new Date(departDate);
      if (selectedDate < currentDate) {
          alert('Departure date cannot be in the past. Please select a date on or after today.');
          return;
      }

      const mode = flightId ? 'edit_oneway_flight' : 'add_oneway_flight';
      const payload = {
          mode: mode,
          flight_id: flightId,
          flight_from: flightFrom,
          flight_to: flightTo,
          depart_date: departDate,
          depart_time: departTime,
          available_seats: availableSeats,
          baggage_limit: baggageLimit,
          amount: amount
      };

      fetch('http://localhost/Finalc/colab_final/connect.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  alert(flightId ? 'One-way flight updated successfully' : 'One-way flight added successfully');
                  fetchOnewayFlights();
                  onewayFlightDialog.close();
              } else {
                  alert('Error: ' + data.message);
              }
          })
          .catch(error => console.error('Error saving one-way flight:', error));
  });

  // Handle adding/editing return flights
  const returnFlightDialog = document.getElementById('return-flight-dialog');
  const returnFlightForm = document.getElementById('return-flight-form');
  const addReturnFlightBtn = document.getElementById('add-return-flight-btn');
  const returnCancelBtn = document.getElementById('return-cancel-btn');

  addReturnFlightBtn.addEventListener('click', () => {
      document.getElementById('return-dialog-title').textContent = 'Add Return Flight';
      returnFlightForm.reset();
      document.getElementById('return-flight-id').value = '';
      returnFlightDialog.showModal();
  });

  returnCancelBtn.addEventListener('click', () => {
      returnFlightDialog.close();
  });

  returnFlightForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const flightId = document.getElementById('return-flight-id').value;
      const flightFrom = document.getElementById('return-flight-from').value;
      const flightTo = document.getElementById('return-flight-to').value;
      const departDate = document.getElementById('return-depart-date').value;
      const returnDate = document.getElementById('return-return-date').value;
      const departTime = document.getElementById('return-depart-time').value;
      const returnTime = document.getElementById('return-return-time').value;
      const availableSeats = parseInt(document.getElementById('return-available-seats').value);
      const baggageWeight = parseInt(document.getElementById('return-baggage-weight').value);
      const amount = parseFloat(document.getElementById('return-amount').value) || 0.00;

      // Validate departure date
      const currentDate = new Date(today);
      const selectedDepartDate = new Date(departDate);
      const selectedReturnDate = new Date(returnDate);
      if (selectedDepartDate < currentDate) {
          alert('Departure date cannot be in the past. Please select a date on or after today.');
          return;
      }
      if (selectedReturnDate < selectedDepartDate) {
          alert('Return date cannot be before the departure date.');
          return;
      }

      const mode = flightId ? 'edit_return_flight' : 'add_return_flight';
      const payload = {
          mode: mode,
          flight_id: flightId,
          flight_from: flightFrom,
          flight_to: flightTo,
          depart_date: departDate,
          return_date: returnDate,
          depart_time: departTime,
          return_time: returnTime,
          available_seats: availableSeats,
          baggage_weight: baggageWeight,
          amount: amount
      };

      fetch('http://localhost/Finalc/colab_final/connect.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  alert(flightId ? 'Return flight updated successfully' : 'Return flight added successfully');
                  fetchReturnFlights();
                  returnFlightDialog.close();
              } else {
                  alert('Error: ' + data.message);
              }
          })
          .catch(error => console.error('Error saving return flight:', error));
  });

  // Initial data fetching
  fetchTotalBookings();
  fetchTodaysBookings();
  fetchPendingRequests();
  fetchTodaysMessages();
  fetchRegisteredUsers();
  fetchTodaysUsers();
  fetchTotalRevenue();
  fetchTodaysRevenue();
  fetchUsers();
  fetchContactMessages();
  fetchRecentBookings();
  fetchOnewayFlights();
  fetchReturnFlights();

  // Logout Functionality
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      localStorage.removeItem('user');
      localStorage.removeItem('Username');
      window.location.href = 'login.html';
  });
});