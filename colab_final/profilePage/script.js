document.addEventListener('DOMContentLoaded', function() {
    // Get all the elements we need
    const uploadBtn = document.getElementById('uploadBtn');
    const removeBtn = document.getElementById('removeBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const fileInput = document.getElementById('upload');
    const profilePic = document.getElementById('profile-pic');
    const popupOverlay = document.getElementById('popupOverlay');
    const successMessage = document.getElementById('successMessage');

    // Upload photo functionality
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function() {
        previewPhoto();
    });

    // Remove photo functionality
    removeBtn.addEventListener('click', removePhoto);

    // Delete profile functionality
    deleteBtn.addEventListener('click', openPopup);
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    cancelDeleteBtn.addEventListener('click', closePopup);

    // Functions
    function previewPhoto() {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profilePic.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    function removePhoto() {
        profilePic.src = 'https://i.pinimg.com/236x/00/80/ee/0080eeaeaa2f2fba77af3e1efeade565.jpg';
    }

    function openPopup() {
        popupOverlay.style.display = "flex";
    }

    function closePopup() {
        popupOverlay.style.display = "none";
    }

    function confirmDelete() {
        // Set the profile picture to the default image
        profilePic.src = 'https://i.pinimg.com/236x/00/80/ee/0080eeaeaa2f2fba77af3e1efeade565.jpg';
        fileInput.value = ''; // Clear the uploaded file
        closePopup();
        
        // Show success message
        successMessage.style.display = 'block';

        // Hide the success message after 2 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 2000);
    }
});