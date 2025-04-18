// Initialize recent searches from localStorage
let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

// Website features with support for multiple aliases
const websiteFeatures = [
    { aliases: ["Home"], url: "index.html", description: "Go to Home Page" },
    { aliases: ["About"], url: "about.html", description: "Learn About Us" },
    { aliases: ["Flights"], url: "flights.html", description: "Search for flights" },
    { aliases: ["Contact"], url: "help.html#Contacts", description: "Contact Us" },
    { aliases: ["Hotels"], url: "hotel_section.html", description: "Search for hotels" },
    { aliases: ["Services"], url: "services.html", description: "Our Services" },
    { aliases: ["Help"], url: "help.html", description: "Help Section" },
];

// Create a lookup map for easier access
const featureMap = {};
websiteFeatures.forEach(feature => {
    feature.aliases.forEach(alias => {
        featureMap[alias.toLowerCase()] = { url: feature.url, description: feature.description };
    });
});

// Extract predefined suggestions from website features (all aliases)
const predefinedSuggestions = websiteFeatures.flatMap(feature => feature.aliases);

function toggleSearchBar() {
    const searchBar = document.getElementById('searchBar');
    const suggestionsContainer = document.getElementById('searchSuggestions');
    
    if (searchBar.style.display === 'inline-block') {
        searchBar.style.display = 'none';
        suggestionsContainer.style.display = 'none';
    } else {
        searchBar.style.display = 'inline-block';
        searchBar.focus();
        showSuggestions('');
    }
}

function showSuggestions(input) {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    suggestionsContainer.innerHTML = '';
    
    if (input || recentSearches.length > 0) {
        suggestionsContainer.style.display = 'block';
    } else {
        suggestionsContainer.style.display = 'none';
        return;
    }

    if (recentSearches.length > 0) {
        const recentHeader = document.createElement('div');
        recentHeader.className = 'suggestions-header';
        recentHeader.textContent = 'Recent Searches';
        suggestionsContainer.appendChild(recentHeader);

        recentSearches.forEach((search, index) => {
            const div = document.createElement('div');
            div.className = 'suggestion-item recent-search';
            div.innerHTML = `
                <i class="fa fa-history" aria-hidden="true" id="history"></i>
                <span class="search-text" onclick="selectSuggestion('${search}')">${search}</span>
                <span class="description">${featureMap[search.toLowerCase()]?.description || 'Recent search'}</span>
                <span class="remove-btn" onclick="removeRecentSearch(event, ${index})">×</span>
            `;
            suggestionsContainer.appendChild(div);
        });
    }

    const filteredSuggestions = predefinedSuggestions
        .filter(item => item.toLowerCase().includes(input.toLowerCase()) && !recentSearches.includes(item))
        .slice(0, 5 - recentSearches.length);

    if (filteredSuggestions.length > 0 && input) {
        const suggestionsHeader = document.createElement('div');
        suggestionsHeader.className = 'suggestions-header';
        suggestionsHeader.textContent = 'Suggestions';
        suggestionsContainer.appendChild(suggestionsHeader);

        filteredSuggestions.forEach(suggestion => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `${suggestion} <span class="description">${featureMap[suggestion.toLowerCase()].description}</span>`;
            div.onclick = () => selectSuggestion(suggestion);
            suggestionsContainer.appendChild(div);
        });
    }
}

function selectSuggestion(suggestion) {
    const searchBar = document.getElementById('searchBar');
    searchBar.value = suggestion;
    addToRecentSearches(suggestion);
    navigateToFeature(suggestion);
    document.getElementById('searchSuggestions').style.display = 'none';
    searchBar.value = '';
}

function addToRecentSearches(searchTerm) {
    if (!recentSearches.includes(searchTerm)) {
        recentSearches.unshift(searchTerm);
        recentSearches = recentSearches.slice(0, 5);
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
}

function removeRecentSearch(event, index) {
    event.stopPropagation();
    recentSearches.splice(index, 1);
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    showSuggestions(document.getElementById('searchBar').value);
}

function navigateToFeature(searchTerm) {
    const feature = featureMap[searchTerm.toLowerCase()];
    const resultsContainer = document.getElementById('searchResults');
    
    if (feature) {
        window.location.href = feature.url;
        
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'block';
        const resultHeader = document.createElement('h3');
        resultHeader.textContent = `Navigating to: ${searchTerm}`;
        resultsContainer.appendChild(resultHeader);
        
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.textContent = feature.description;
        resultsContainer.appendChild(resultItem);
    } else {
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'block';
        const resultHeader = document.createElement('h3');
        resultHeader.textContent = `Results for "${searchTerm}"`;
        resultsContainer.appendChild(resultHeader);
        
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.textContent = `No page found for "${searchTerm}"`;
        resultsContainer.appendChild(resultItem);
    }
}

document.getElementById('searchBar').addEventListener('input', (e) => {
    showSuggestions(e.target.value);
});

document.getElementById('searchBar').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
        addToRecentSearches(e.target.value.trim());
        navigateToFeature(e.target.value.trim());
        e.target.value = '';
    }
});

document.addEventListener('click', (e) => {
    const searchContainer = document.querySelector('.search-container');
    const searchBar = document.getElementById('searchBar');
    const suggestionsContainer = document.getElementById('searchSuggestions');
    
    if (!searchContainer.contains(e.target)) {
        searchBar.style.display = 'none';
        suggestionsContainer.style.display = 'none';
    }
});

function handleLogout() {
    recentSearches = [];
    localStorage.removeItem('recentSearches');
    document.getElementById('searchResults').style.display = 'none';
}

const styles = `
    .suggestions-container {
        display: none;
        position: absolute;
        top: 100%;
        right: -40px;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        width: 200px;
        max-height: 300px;
        overflow-y: auto;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        z-index: 1000;
    }
    
    .suggestions-header {
        padding: 5px 10px;
        background:rgb(207, 208, 209);
        color: #666;
        font-size: 12px;
        font-weight: bold;
        text-transform: uppercase;
    }
    
    .suggestion-item {
        padding: 8px 10px;
        cursor: pointer;
        transition: background-color 0.2s;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .suggestion-item:hover {
        background-color: #f0f0f0;
    }
    
    .suggestion-item .recent-icon {
        margin-right: 8px;
        color: #666;
    }
    
    .suggestion-item .search-text {
        flex-grow: 1;
        cursor: pointer;
    }
    
    .suggestion-item .description {
        font-size: 12px;
        color: #888;
        margin-right: 10px;
    }
    
    .suggestion-item .remove-btn {
        font-size: 16px;
        color: #666;
        cursor: pointer;
        padding: 0 5px;
    }
    
    .suggestion-item .remove-btn:hover {
        color: #ff0000;
    }
    
    .recent-search {
        border-bottom: 1px solid #f0f0f0;
    }
    
    #history{
    margin-right: 5px;
    color: gray;
    }
    
    .recent-search:last-child {
        border-bottom: none;
    }
    
    .search-results-container {
        margin-top: 20px;
        padding: 15px;
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        max-width: 600px;
    }
    
    .result-item {
        padding: 10px;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .result-item:last-child {
        border-bottom: none;
    }
    
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);