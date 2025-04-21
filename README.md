<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="plane.png" type="image/x-icon">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" integrity="sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"> -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <title>Airwings - Flight Booking</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
        }

        body {
            background-color: #f5f5f5;
            color: #333;
            font-size: 14px;
        }

        header {
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #007bff;
            color: white;
            height: 100px;
            margin-bottom: 20px;
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
            padding: 10px;
        }

        .header1 {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        input, button {
            padding: 8px;
            border-radius: 5px;
            border: 1px solid #ccc;
            font-size: 14px;
        }

        button {
            background-color: #D32F2F;
            color: white;
            cursor: pointer;
            transition: background 0.3s;
            padding: 10px 15px;
            border: none;
        }

        button:hover {
            background-color: green;
        }

        .container {
            display: flex;
            gap: 20px;
            padding: 20px;
            flex-wrap: wrap;
        }

        .mainleft {
            flex: 1;
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            max-width: 300px;
        }

        .mainleft h3 {
            margin-bottom: 10px;
        }

        .mainleft label, .mainleft input {
            display: block;
            margin-bottom: 10px;
        }

        .mainleft label {
            display: inline-block;
            margin-right: 15px;
        }

        .mainleft input[type="radio"] {
            margin-right: 5px;
        }

        .mainright {
            flex: 2;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }

        .flight-card {
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-direction: column;
            text-align: center;
        }

        .flight-card img {
            width: auto;
            max-width: 100%;
            max-height: 150px;
            border-radius: 10px;
            margin-bottom: 10px;
        }

        .flight-card .flight-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            font-size: 14px;
            text-align: center;
        }

        .flight-card .flight-details div {
            flex: 1;
        }

        .all-button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
            margin-top: 10px;
        }

        .all-button:hover {
            background-color: #0056b3;
        }

        input[type="text"] {
            background-size: 20px 20px;
            background-repeat: no-repeat;
            background-position: 10px center;
            padding-left: 40px;
        }

        input[type="text"].from {
            background-image: url('from.svg');
        }

        input[type="text"].to {
            background-image: url('whereto.svg');
        }

        input[type="text"].search {
            background-image: url('search.svg');
        }

        @media (max-width: 1024px) {
            .container {
                flex-direction: column;
                align-items: center;
            }

            .mainright {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            .header1 {
                flex-direction: column;
                text-align: center;
            }

            input, button {
                width: 100%;
                margin-bottom: 10px;
            }
        }

        /* Custom Alert Modal */
        .alert-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            justify-content: center;
            align-items: center;
        }

        .alert-modal .modal-content {
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            width: 300px;
        }

        .alert-modal button {
            background-color: #D32F2F;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
        }

        .alert-modal button:hover {
            background-color: green;
        }
        .footer {
        background-color: #003366; /* Light gray background */
        color: white;
        padding: 20px;
        text-align: center;
        height: 177px;
    }
    
    .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 0 20px; /* Add padding to the left and right */

    }
    
    .follow-us h3,
    .subscribe h3 {
        font-size: 1.2em;
        margin-bottom: 10px;
        text-align: left;
    }
    
    .social-icons a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #fff;
        color: #333;
        text-decoration: none;
        margin-right: 10px;
        border: 1px solid #ccc; /* Add a border */
    }
    
    .social-icons i {
        font-size: 16px; /* Adjust icon size */
    }
    .subscribe-form {
        display: flex;
        align-items: center;
        text-align: left;
     
    }
    
    .subscribe-form input[type="email"] {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 15px;
        margin-right: 5px;
        width: 200px; /* Adjust width */
    }
    
    .subscribe-form button {
        padding: 8px 12px;
        background-color: #fff;
        color: #333;
        border: 1px solid #ccc;
        border-radius: 15px;
                cursor: pointer;
    }
    
    .footer-links {
        margin-bottom: 10px;
    }
    
    .footer-links a {
        color: white;
        text-decoration: none;
        margin: 0 10px;
        font-size: 0.9em;
    }
    
    .copyright p {
        font-size: 0.8em;
        color: white;
    }
    
    /* Add space for small social media icons */
    .fa-solid {
        margin: auto;
    }
    .top-bar {
    background-color: #7db7ec;
    color: white;
    text-align: center;
    padding: 3px;
    font-size: 0.8rem;
    margin-bottom: 0;

}

.top-bar .close-button {
    float: right;
    margin-right: 10px;
    cursor: pointer;
}
 /* end */

 /* start */
/* General navbar styling */
nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px ; /* Adjusted padding for better spacing */
    background: white;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1); /* Softer shadow */
    border-bottom: 2px solid #f1f1f1; /* Light border for a sleek look */
    margin-bottom: 4%;
}

/* Logo styling */
.logo {
    font-size: 1.5rem;
    font-weight: bold;
    font-style: italic;
    color: #155577;
}

/* Navigation List */
.nav-links {
    list-style: none;
    display: flex;
    align-items: center;
    gap: 25px; /* Standardized gap for better alignment */
    flex-grow: 1;
    justify-content: center;
}

/* Style for each nav item */
.nav-links li {
    align-items: center;

}

/* Remove default link styling */
.nav-links a {
    text-decoration: none;
    color: black;
    font-size: 1rem;
    font-weight: 500;
    transition: 0.3s ease-in-out;
    padding: 10px 15px; /* Padding for better clickability */
    border-radius: 5px;
}

.nav-links a:hover {
    color: white;
    background: #7db7ec; /* Background highlight on hover */
}

/* Search & Profile Icons */
.nav-icons {
    display: flex;
    align-items: center;
    gap: 15px; /* Standardized spacing */
}

.search-container {
    position: relative;
    margin-right: 45px; /* Standardized spacing */
}

.search-bar {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    width: 150px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
    outline: none;
}

.search-container i {
    cursor: pointer;
    font-size: 1.2rem;
    color: #7db7ec;
}

.nav-icons a i {
    font-size: 1.2rem;
    color: black;
    transition: 0.3s;
}

.nav-icons a i:hover {
    color: #7db7ec;
}


#searchIcon{
    cursor: pointer;
}

/* Profile icon styling */
.profile-icon {
    font-size: 1.4rem;
    cursor: pointer;
}
    </style>
</head>
<body>
    <div class="top-bar">
        <p>Join AirWings today and save up to 20% on your flight using code TRAVEL at checkout. Promotion valid for new starsonly.</p>
    </div>
    <nav>
        <div class="logo"><i><b>AirWings</b></i></div>
        <ul class="nav-links">
            <li><a href="#">Home</a></li>
            <li><a href="#">Flights</a></li>
            <li><a href="#">Hotel</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">Service</a></li>
            <li><a href="#">Help</a></li>
        </ul>
        <div class="nav-icons">
            <div class="search-container">
                <i class="fa-solid fa-search" id="searchIcon" onclick="toggleSearchBar()"></i>
                <input type="text" id="searchBar" placeholder="Search..." class="search-bar">
            </div>
            <a href="#"><i class="fa-solid fa-user"></i></a>
        </div>
    </nav>

    <header>
        <div class="header1">
            <h1>DISCOVER Flights</h1>
            <form action="/fromwhere" method="post" onsubmit="return validateForm">
            <input list="places" type="text" name="from" class="from" placeholder="From Where?" id="from">
            <input list="places" type="text" name="to" class="to" placeholder="Where To?" id="to">
            
    <datalist id="places">
        <option value="Kathmandu">
        <option value="Pokhara">
        <option value="Lukla">
        <option value="Biratnagar">
        <option value="Nepalgunj">
        <option value="Bhairahawa">
        <option value="Janakpur">
        <option value="Simara">
        <option value="Tumlingtar">
        <option value="Bharatpur">
        <option value="Dhangadhi">
        <option value="Jomsom">
        <option value="Surkhet">
        <option value="Taplejung">
        <option value="Rukum">
        <option value="Jumla">
        <option value="Dang">
        <option value="Rajbiraj">
        <option value="Phaplu">
        <option value="Manang">
        <!-- You can add more as needed -->
    </datalist>
    <label for="">
        <input type="radio" name="tripType" value="oneway" checked onchange="toggleReturnDate()">One Way
    </label>
    <label for=""><input type="radio" name="tripType" value="round" onchange="toggleReturnDate()">Round Trip</label>
      
            <input type="date" name="departDate" id="departDate">
            <input type="date" name="returnDate" id="returnDate" style="display:none;">
            <input type="number" name="person" min="1" max="10" placeholder="Adult" id="adult">
            <button onclick="validateForm()">Search</button>
        </form>
        </div>
    </header>
    <main>
        <div class="container">
            <div class="mainleft">
                <h3>Sort By</h3>
                <label><input type="radio" name="sort"> High Price</label>
                <label><input type="radio" name="sort"> Low Price</label>
                <label><input type="radio" name="sort"> Popular</label>
                <h3>Cabin</h3>
                <label><input type="radio" name="cabin"> Economy</label>
                <label><input type="radio" name="cabin"> Business</label>
                <h3>Price Range</h3>
                <input type="range" min="5000" max="500000">
                <h3>Airlines</h3>
                <input class="search" type="text" placeholder="Name of the Airlines">
            </div>
            <div class="mainright">
                <div class="flight-card">
                    <img src="/airplane1.jpeg" alt="Flight Image">
                    <div>kathmandu-dubai &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;starting from rs10000</div>
                    <div class="flight-details">
                        <div>Departure &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Arrival</div>
                        
                    </div>
                    <div>Budha Airways</div>
                    <button class="all-button">Book</button>
                </div>
                <div class="flight-card">
                    <img src="/airplane1.jpeg" alt="Flight Image">
                    <div>kathmandu-dubai &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;starting from rs10000</div>
                    <div class="flight-details">
                        <div>Departure &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Arrival</div>
                       
                    </div>
                    <div>Budha Airways</div>
                    <button class="all-button">Book</button>
                </div>
            </div>
        </div>
    </main>

    <!-- Custom Alert Modal -->
    <div class="alert-modal" id="alert-modal">
        <div class="modal-content">
            <p>Please fill in all the required fields.</p>
            <button onclick="closeAlert()">Close</button>
        </div>
    </div>
    <footer class="footer">
        <div class="footer-content">
            <div class="follow-us">
                <h3>Follow Us</h3>
                <div class="social-icons">
                    <a href="#"><i class="fab fa-facebook-f"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                    <a href="#"><i class="fab fa-telegram"></i></a>
                    <a href="#"><i class="fa-solid fa-ellipsis"></i></a>
                </div>
            </div>

            <div class="subscribe">
                <h3>Subscribe</h3>
                <div class="subscribe-form">
                    <input type="email" placeholder="Enter your email Address">
                    <button>Subscribe</button>
                </div>
            </div>
        </div>

        <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Sales and Refunds</a>
            <a href="#">Contact Us</a>
            <a href="#">Help center</a>
        </div>

        <div class="copyright">
            <p>© 2020 All Rights Reserved</p>
        </div>
    </footer>


    <script>
        function validateForm() {
            var from = document.getElementById("from").value;
            var to = document.getElementById("to").value;
            var departDate = document.getElementById("departDate").value;
            var returnDate = document.getElementById("returnDate").value;
            var adult = document.getElementById("adult").value;

            if (!from || !to || !departDate || !returnDate|| !adult) {
                document.getElementById("alert-modal").style.display = 'flex';
            } else {
                alert("Search initiated.");
            }
        }

        function closeAlert() {
            document.getElementById("alert-modal").style.display = 'none';
        }
        function toggleReturnDate(){
         const returnDateInput = document.getElementById('returnDate');
        const roundTrip = document.querySelector('input[name="tripType"]:checked').value === 'round';
        returnDateInput.style.display = roundTrip ? 'inline' : 'none';
        returnDateInput.required = roundTrip;
        }
         function validateForm() {
        const from = document.getElementById('from').value.trim();
        const to = document.getElementById('to').value.trim();
        if (from === to) {
            alert("From and To locations cannot be the same.");
            return false;
        }
        return true;
    }
    </script>
</body>
</html>
