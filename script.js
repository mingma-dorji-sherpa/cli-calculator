const sections = document.querySelectorAll(".section");
let isScrolling = false;

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

document.querySelector(".menu").addEventListener("click", function() {
    this.classList.toggle("active"); // Toggle the 'active' class on click
  });

// Function to resize canvas
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    drawImageOnCanvas(); // Redraw image after resizing
}
window.addEventListener("resize", resizeCanvas);

// Function to load and draw the image
function drawImageOnCanvas() {
    const img = new Image();
    img.src = "SUSHANT PHOTO.png"; // Use relative path if image is inside project
    img.onload = function () {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Stretch image to fit canvas
    };
}
drawImageOnCanvas(); // Call this function initially

// Scroll event listener
window.addEventListener("wheel", (event) => {
    if (isScrolling) return;

    isScrolling = true;
    setTimeout(() => isScrolling = false, 900); // Prevents rapid jumps

    const direction = event.deltaY > 0 ? 1 : -1; // Scroll down (1) or up (-1)
    const currentSection = getCurrentSection();

    if (currentSection !== null) {
        let nextIndex = currentSection + direction;
        nextIndex = Math.max(0, Math.min(sections.length - 1, nextIndex)); // Keep within bounds

        if (nextIndex !== currentSection) {
            sections[nextIndex].scrollIntoView({ behavior: "smooth" });
        }
    }
});

// Function to determine the current section
function getCurrentSection() {
    let index = 0;
    let minDifference = window.innerHeight; // Find section closest to the top

    sections.forEach((section, i) => {
        const rect = section.getBoundingClientRect();
        const difference = Math.abs(rect.top);

        if (difference < minDifference) {
            minDifference = difference;
            index = i;
        }
    });

    return index;
}
