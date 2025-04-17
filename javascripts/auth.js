const userData = JSON.parse(localStorage.getItem("user")) || {};

document.addEventListener("DOMContentLoaded", () => {
    const socialIcons = document.querySelectorAll(".social-icons a");
    const signInBtn = document.getElementById("signIn");
    const userContainer = document.getElementById("userContainer");
    const profileIcon = document.getElementById("loginLink");

    // Check for stored user and update UI on page load
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        const user = JSON.parse(storedUser);
        updateNavbar(user);
        displayUserData(user);
        fetchAndDisplayUserData(user.username || user.email.split('@')[0]);
    } else {
        showSignInButton();
        showDefaultUserIcon();
    }

    // Store current URL for redirect after login
    const currentUrl = window.location.href;
    localStorage.setItem('redirectTo', currentUrl);

    // Google OAuth login
    socialIcons.forEach((icon) => {
        icon.addEventListener("click", async (event) => {
            event.preventDefault();
            const provider = "google";
            const redirectURI = encodeURIComponent("http://127.0.0.1:5500/index.html");
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=1077508048882-ogokqnn45fid8fp5305a82a393pis8ru.apps.googleusercontent.com&redirect_uri=${redirectURI}&response_type=token&scope=email%20profile&prompt=consent`;
            window.location.href = authUrl;
        });
    });

    // Manual login form submission
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            loginWithDatabase(username, password);
        });
    }

    // Handle OAuth redirect and token
    function handleOAuthRedirect() {
        const storedUser = localStorage.getItem("user");
        if (storedUser) return; // Skip if user is already logged in

        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = urlParams.get("access_token");

        if (accessToken) {
            console.log("Access token received:", accessToken);
            localStorage.setItem("google_access_token", accessToken);
            fetchUserProfile("google", accessToken);
        } else if (urlParams.get("error")) {
            console.error("OAuth error:", urlParams.get("error_description"));
            alert("❌ Authentication failed: " + urlParams.get("error_description"));
        } else {
            console.warn("No access token found in URL hash:", window.location.hash);
        }
    }

    // Fetch Google user profile and save to database
    async function fetchUserProfile(provider, token) {
        try {
            if (!token || typeof token !== "string" || token.trim() === "") {
                throw new Error("Invalid or missing access token");
            }

            console.log("Fetching Google user profile with token:", token);
            const response = await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("Response status:", response.status, "OK:", response.ok);

            if (!response.ok) {
                const contentType = response.headers.get("content-type") || "";
                let errorText;

                if (contentType.includes("application/json")) {
                    const errorData = await response.json();
                    errorText = JSON.stringify(errorData);
                } else {
                    errorText = await response.text();
                }

                console.error("Google API error:", response.status, errorText);
                throw new Error(`Failed to fetch user data: ${response.status} - ${errorText}`);
            }

            const contentType = response.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
                const errorText = await response.text();
                console.error("Unexpected response format:", errorText);
                throw new Error("Response is not JSON: " + errorText);
            }

            const userData = await response.json();
            console.log("Google user data:", userData);

            if (!userData.email) {
                throw new Error("No email found in Google user data");
            }

            // Extract first name from userData.name, capitalize first letter, lowercase the rest
            let firstName = userData.name ? userData.name.split(' ')[0] : userData.email.split('@')[0];
            firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

            const standardizedUser = {
                username: firstName,
                email: userData.email,
                user_image: userData.picture || 'https://default-image-url.com/default.jpg',
                provider: "google"
            };

            // Save or update user in database
            const savedUser = await saveUserToDatabase(standardizedUser);

            localStorage.setItem("user", JSON.stringify(savedUser));
            updateNavbar(savedUser);
            displayUserData(savedUser);

            // Clear URL hash to prevent reprocessing
            window.history.replaceState({}, document.title, window.location.pathname);

            showSuccessDialog("✅ Login successful!", () => {
                const redirectTo = localStorage.getItem('redirectTo') || 'index.html';
                localStorage.removeItem('redirectTo');
                if (window.location.pathname !== redirectTo) {
                    window.location.href = redirectTo;
                }
            });
        } catch (error) {
            console.error("Error in fetchUserProfile:", error.message, error.stack);
            alert("❌ Error during Google login: " + error.message);
        }
    }

    // Save user to database (check by email, update if exists, register if new)
    async function saveUserToDatabase(user) {
        try {
            // Check if user exists by email
            const checkResponse = await fetch('http://localhost/Finalc/colab_final/connect.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: "get_user_by_email",
                    email: user.email
                })
            });

            const checkResult = await checkResponse.json();
            console.log("Check user by email result:", checkResult);

            if (!checkResponse.ok || !checkResult) {
                throw new Error("Failed to check user in database");
            }

            if (checkResult.success) {
                // User exists (normal or Google), update profile picture and provider
                const updatedUser = {
                    username: checkResult.user.username, // Keep existing username
                    email: checkResult.user.email,
                    user_image: user.user_image,
                    provider: "google"
                };

                const updateResponse = await fetch('http://localhost/Finalc/colab_final/connect.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mode: "update_user",
                        username: updatedUser.username,
                        user_image: user.user_image,
                        provider: "google"
                    })
                });

                const updateResult = await updateResponse.json();
                if (!updateResponse.ok || !updateResult) {
                    throw new Error("Failed to update user in database");
                }

                if (updateResult.success) {
                    updatedUser.user_image = `http://127.0.0.1:5500${updateResult.user_image}`;
                } else {
                    console.warn("Failed to update user data:", updateResult.message);
                    throw new Error(updateResult.message || "Failed to update user");
                }

                return updatedUser;
            } else {
                // Generate unique username
                let uniqueUsername = user.username;
                let attempt = 1;
                let usernameAvailable = false;

                while (!usernameAvailable) {
                    const usernameCheckResponse = await fetch('http://localhost/Finalc/colab_final/connect.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            mode: "get_user",
                            username: uniqueUsername
                        })
                    });

                    const usernameCheckResult = await usernameCheckResponse.json();
                    if (!usernameCheckResponse.ok || !usernameCheckResult) {
                        throw new Error("Failed to check username availability");
                    }

                    if (usernameCheckResult.success) {
                        uniqueUsername = `${user.username}${attempt}`;
                        attempt++;
                    } else {
                        usernameAvailable = true;
                    }
                }

                // Register new user
                const registerResponse = await fetch('http://localhost/Finalc/colab_final/connect.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        mode: "register",
                        Username: uniqueUsername,
                        Email: user.email,
                        Password: `google_${user.email}`
                    }).toString()
                });

                const registerResult = await registerResponse.json();
                if (!registerResponse.ok || !registerResult.success) {
                    throw new Error(registerResult.message || "Failed to register user");
                }

                // Update profile picture
                const updateImageResponse = await fetch('http://localhost/Finalc/colab_final/connect.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mode: "update_picture",
                        username: uniqueUsername,
                        user_image: user.user_image
                    })
                });

                const updateImageResult = await updateImageResponse.json();
                if (!updateImageResponse.ok || !updateImageResult) {
                    throw new Error("Failed to update user image in database");
                }

                if (updateImageResult.success) {
                    user.user_image = `http://127.0.0.1:5500${updateResult.user_image}`;
                } else {
                    console.warn("Failed to store profile picture:", updateImageResult.message);
                    throw new Error(updateImageResult.message || "Failed to store profile picture");
                }

                user.username = uniqueUsername;
                return user;
            }
        } catch (error) {
            console.error("Error saving user to database:", error.message);
            throw error;
        }
    }

    // Login with database
    async function loginWithDatabase(username, password) {
        try {
            const response = await fetch('http://localhost/Finalc/colab_final/connect.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    mode: "login",
                    Username: username,
                    Password: password
                }).toString()
            });

            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Login failed");

            const standardizedUser = {
                username: result.user.username,
                email: result.user.email,
                user_image: result.user.user_image ? `http://127.0.0.1:5500${result.user.user_image}` : 'https://default-image-url.com/default.jpg',
                provider: "database"
            };

            // Clear Google token to avoid conflicts
            localStorage.removeItem("google_access_token");
            localStorage.setItem("user", JSON.stringify(standardizedUser));
            updateNavbar(standardizedUser);
            displayUserData(standardizedUser);

            showSuccessDialog("✅ Login successful!", () => {
                const redirectTo = localStorage.getItem('redirectTo') || 'index.html';
                localStorage.removeItem('redirectTo');
                if (window.location.pathname !== redirectTo) {
                    window.location.href = redirectTo;
                }
            });
        } catch (error) {
            console.error("Error in database login:", error.message);
            alert("❌ Login failed: " + error.message);
        }
    }

    // Fetch and display user data from database
    async function fetchAndDisplayUserData(username) {
        try {
            const response = await fetch('http://localhost/Finalc/colab_final/connect.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: "get_user", username })
            });

            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Failed to fetch user data");

            const standardizedUser = {
                username: result.user.username,
                email: result.user.email,
                user_image: result.user.user_image ? `http://127.0.0.1:5500${result.user.user_image}` : 'https://default-image-url.com/default.jpg',
                provider: result.user.provider || "database"
            };

            localStorage.setItem("user", JSON.stringify(standardizedUser));
            updateNavbar(standardizedUser);
            displayUserData(standardizedUser);
        } catch (error) {
            console.error("Error fetching user data:", error.message);
        }
    }

    // Display user info in UI
    function displayUserData(user) {
        const userInfoContainer = document.getElementById("userInfoContainer");
        if (!userInfoContainer) return;

        userInfoContainer.innerHTML = `
            <div class="user-info">
                <img src="${user.user_image}" alt="Profile Picture" class="profile-pic" onerror="this.src='https://default-image-url.com/default.jpg'" />
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Email:</strong> ${user.email}</p>
            </div>
        `;
    }

    // Update navbar with user info
    function updateNavbar(user) {
        if (signInBtn) signInBtn.classList.add("hide");
        if (profileIcon) profileIcon.classList.remove("hide");

        userContainer.innerHTML = "";

        const profileContainer = document.createElement("div");
        profileContainer.classList.add("user-profile");
        profileContainer.innerHTML = `
            <span class="user-name">Hi, ${user.username ? user.username.split(' ')[0] : user.email.split('@')[0]}</span>
            <img src="${user.user_image}" alt="User Image" class="user-img" onerror="this.src='user.png'" />
        `;

        const logoutContainer = document.createElement("div");
        logoutContainer.classList.add("logout-container");
        logoutContainer.innerHTML = `
            ${user.provider !== "google" ? '<button class="picturebtn">Change Picture</button>' : ''}
            <button class="clear-btn">Clear</button>
            <button class="logout-btn">Logout</button>`;
        logoutContainer.style.display = "none";

        profileContainer.appendChild(logoutContainer);
        userContainer.appendChild(profileContainer);

        // Toggle logout container visibility
        profileContainer.addEventListener("click", (event) => {
            event.stopPropagation();
            logoutContainer.style.display = logoutContainer.style.display === "block" ? "none" : "block";
        });

        // Change profile picture
        const pictureBtn = logoutContainer.querySelector(".picturebtn");
        if (pictureBtn) {
            pictureBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                const dialog = createPictureDialog(user);
                document.body.appendChild(dialog);
                setupPictureDialog(dialog, user, profileContainer);
            });
        }

        // Clear chat history
        const clearBtn = logoutContainer.querySelector(".clear-btn");
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
                chatHistory = chatHistory.filter(message => message.type === 'welcome');
                localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
                localStorage.setItem('isFirstMessageAfterClear', 'true');
                localStorage.removeItem('lastMessageTime');
                if (typeof loadChatHistory === 'function') loadChatHistory();
                alert("Chat history cleared!");
            });
        }

        // Logout functionality
        logoutContainer.querySelector(".logout-btn").addEventListener("click", (event) => {
            event.stopPropagation();
            const dialog = document.createElement("div");
            dialog.classList.add("custom-dialog");
            dialog.innerHTML = `
                <div class="dialog-content">
                    <p>Logging out will clear your chat history!<br> Are you sure you want to log out?</p>
                    <button id="confirm-logout">Yes</button>
                    <button id="cancel-logout">No</button>
                </div>
            `;
            document.body.appendChild(dialog);
            dialog.style.opacity = "1";

            document.getElementById("confirm-logout").addEventListener("click", () => {
                dialog.querySelector(".dialog-content").innerHTML = `<p>✅ Logged out successfully!</p>`;
                dialog.style.opacity = "1";

                localStorage.removeItem("user");
                localStorage.removeItem("google_access_token");
                localStorage.removeItem("chatHistory");
                localStorage.removeItem("isFirstMessageAfterClear");
                window.history.replaceState({}, document.title, window.location.pathname);
                userContainer.innerHTML = "";
                showSignInButton();
                showDefaultUserIcon();
                const userInfoContainer = document.getElementById("userInfoContainer");
                if (userInfoContainer) userInfoContainer.innerHTML = "";
                if (typeof loadChatHistory === 'function') loadChatHistory();

                setTimeout(() => {
                    dialog.style.opacity = "0";
                    setTimeout(() => {
                        if (dialog.parentNode) {
                            dialog.parentNode.removeChild(dialog);
                        }
                    }, 600);
                }, 600);
            });

            document.getElementById("cancel-logout").addEventListener("click", () => {
                dialog.style.opacity = "0";
                setTimeout(() => {
                    if (dialog.parentNode) {
                        dialog.parentNode.removeChild(dialog);
                    }
                }, 600);
            });
        });
    }

    // Helper function to show success dialog
    function showSuccessDialog(message, callback) {
        const dialog = document.createElement("div");
        dialog.classList.add("custom-dialog");
        dialog.innerHTML = `<div class="dialog-content"><p>${message}</p></div>`;
        document.body.appendChild(dialog);
        dialog.style.opacity = "1";
        setTimeout(() => {
            dialog.style.opacity = "0";
            setTimeout(() => {
                if (dialog.parentNode) {
                    dialog.parentNode.removeChild(dialog);
                }
                if (callback) callback();
            }, 600);
        }, 600);
    }

    // Helper function to create picture dialog
    function createPictureDialog(user) {
        const dialog = document.createElement("div");
        dialog.classList.add("custom-dialog", "picture-dialog");
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Change Profile Picture</h3>
                <div class="image-preview-container">
                    <img id="imagePreview" src="${user.user_image}" alt="Preview" class="image-preview" onerror="this.src='user.png'" />
                </div>
                <input type="file" id="imageInput" accept="image/*" />
                <button id="cropBtn" style="display: none;">Crop</button>
                <div id="cropControls" style="display: none;">
                    <input type="range" id="cropSlider" min="100" max="200" value="100" />
                </div>
                <div class="dialog-buttons">
                    <div class="action-buttons">
                        <button id="cancelPicture">Cancel</button>
                        <button id="savePicture">Save</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        dialog.style.opacity = "1";
        return dialog;
    }

    // Setup picture dialog functionality
    function setupPictureDialog(dialog, user, profileContainer) {
        const imageInput = dialog.querySelector("#imageInput");
        const imagePreview = dialog.querySelector("#imagePreview");
        const cropBtn = dialog.querySelector("#cropBtn");
        const cropControls = dialog.querySelector("#cropControls");
        const cropSlider = dialog.querySelector("#cropSlider");
        let currentImageSrc = user.user_image;

        imageInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    currentImageSrc = event.target.result;
                    imagePreview.src = currentImageSrc;
                    cropBtn.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });

        cropBtn.addEventListener("click", () => {
            cropControls.style.display = cropControls.style.display === "block" ? "none" : "block";
        });

        cropSlider.addEventListener("input", (e) => {
            const zoomLevel = e.target.value;
            imagePreview.style.transform = `scale(${zoomLevel / 100})`;
            imagePreview.style.transformOrigin = "center";
        });

        dialog.querySelector("#cancelPicture").addEventListener("click", () => {
            dialog.style.opacity = "0";
            setTimeout(() => dialog.remove(), 600);
        });

        dialog.querySelector("#savePicture").addEventListener("click", async () => {
            const updatedUser = { ...user, user_image: currentImageSrc };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            profileContainer.querySelector(".user-img").src = currentImageSrc;

            try {
                const response = await fetch('http://localhost/Finalc/colab_final/connect.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mode: "update_picture",
                        username: user.username || user.email.split('@')[0],
                        user_image: currentImageSrc
                    })
                });

                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.message || "Failed to update picture");

                updatedUser.user_image = `http://127.0.0.1:5500${result.user_image}`;
                localStorage.setItem("user", JSON.stringify(updatedUser));
                profileContainer.querySelector(".user-img").src = updatedUser.user_image;

                dialog.querySelector(".dialog-content").innerHTML = `<p>✅ Picture updated successfully!</p>`;
                setTimeout(() => {
                    dialog.style.opacity = "0";
                    setTimeout(() => dialog.remove(), 600);
                }, 600);

                displayUserData(updatedUser);
            } catch (error) {
                dialog.querySelector(".dialog-content").innerHTML = `<p>❌ Error: ${error.message}</p>`;
                setTimeout(() => {
                    dialog.style.opacity = "0";
                    setTimeout(() => dialog.remove(), 600);
                }, 600);
            }
        });
    }

    // Add styles
    const style = document.createElement("style");
    style.innerHTML = `
        .custom-dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff;
            opacity: 0.95;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            text-align: center;
            transition: opacity 0.6s ease;
            z-index: 1000;
        }
        .picture-dialog .dialog-content {
            width: 240px;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 10px;
        }
        .picture-dialog h3 {
            margin: 0 0 15px;
            color: #333;
            font-family: Arial, sans-serif;
        }
        .image-preview-container {
            width: 150px;
            height: 150px;
            margin: 15px auto;
            overflow: hidden;
            border-radius: 50%;
            border: 2px solid #ddd;
            background: #fff;
        }
        .image-preview {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
            transition: transform 0.3s ease;
        }
        #imageInput {
            margin: 10px 0;
            padding: 5px;
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        #cropBtn {
            background: #007bff;
            color: white;
            padding: 8px 15px;
            border-radius: 5px;
            margin: 10px 0;
            justify-self: center;
            width: 50%;
        }
        #cropBtn:hover {
            background: #0056b3;
        }
        #cropControls {
            margin: 10px 0;
        }
        #cropSlider {
            width: 100%;
            accent-color: #007bff;
        }
        .dialog-buttons {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
        }
        .dialog-buttons button {
            padding: 8px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        .action-buttons {
            display: flex;
            gap: 10px;
        }
        #cancelPicture {
            background: #ff4444;
            color: white;
            margin-right: 50px;
        }
        #cancelPicture:hover {
            background: #cc0000;
        }
        #savePicture {
            background: #28a745;
            color: white;
        }
        #savePicture:hover {
            background: #218838;
        }
        .user-info {
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin: 20px;
            background: #f9f9f9;
        }
        .profile-pic {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin-bottom: 10px;
        }
        .clear-btn {
            background-color: lightblue;
        }
    `;
    document.head.appendChild(style);

    // Utility functions
    function showSignInButton() {
        if (signInBtn) signInBtn.classList.remove("hide");
    }

    function showDefaultUserIcon() {
        userContainer.innerHTML = `<a href="login.html" id="loginLink" style="text-decoration: none; font-size: 14px;">Sign In  <i class="fa-solid fa-user" style="font-size: 16px;"></i></a>`;
    }

    // Initialize OAuth redirect handling
    handleOAuthRedirect();
});