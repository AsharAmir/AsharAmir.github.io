const forecastTableBody = document.getElementById('tableBody');
const loader = document.getElementById('loader');
const chatBox = document.getElementById('chatBox');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const sortAscBtn = document.getElementById('sortAscBtn');
const sortDescBtn = document.getElementById('sortDescBtn');
const filterRainBtn = document.getElementById('filterRainBtn');
const highestTempBtn = document.getElementById('highestTempBtn');

let currentPage = 1;
const rowsPerPage = 10;
let forecastData = []; // Make forecastData global

// Initialize variables for Gemini
let genAI;
const API_KEY = 'AIzaSyA70p4d6eF34Pa-vDhr3KyViMMC2TxwUqI';  // Replace with your actual Gemini API key

// Function to show/hide loader
function showLoader(show) {
    loader.style.display = show ? 'block' : 'none';
}


document.addEventListener('DOMContentLoaded', () => {
    showLoader(true);
    getWeatherData('Islamabad')  // Fetch weather data for a default city isb
        .finally(() => showLoader(false));

    if (sortAscBtn) sortAscBtn.addEventListener('click', showAscendingTemperatures);
    if (sortDescBtn) sortDescBtn.addEventListener('click', showDescendingTemperatures);
    if (filterRainBtn) filterRainBtn.addEventListener('click', filterRainyDays);
    if (highestTempBtn) highestTempBtn.addEventListener('click', showHighestTemperature);
});

// Function to fetch weather data and populate the table
async function getWeatherData(city) {
    try {
        const apiKey = '6667c176838bf8c6a2b1107478d51cc7';  // Replace with your actual OpenWeather API key
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        const forecastData = response.data.list;

        displayTableData(forecastData);
        return forecastData;  // Return data for chatbot to use if needed
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

// Sort temperatures in ascending order
function showAscendingTemperatures() {
    const sortedData = [...forecastData].sort((a, b) => a.main.temp - b.main.temp);
    displayTableData(sortedData);
}

// Sort temperatures in descending order
function showDescendingTemperatures() {
    const sortedData = [...forecastData].sort((a, b) => b.main.temp - a.main.temp);
    displayTableData(sortedData);
}

// Filter only rainy days
function filterRainyDays() {
    const rainyData = forecastData.filter(entry => entry.weather.some(cond => cond.description.includes('rain')));
    displayTableData(rainyData);
}

// Show the day with the highest temperature
function showHighestTemperature() {
    const highestTempEntry = forecastData.reduce((max, entry) => entry.main.temp > max.main.temp ? entry : max, forecastData[0]);
    displayTableData([highestTempEntry]); // Display only the entry with the highest temp
}

// Function to display weather data in the table with pagination
function displayTableData(forecastData) {
    const totalPages = Math.ceil(forecastData.length / rowsPerPage);

    // Clear the table before populating
    forecastTableBody.innerHTML = '';

    // Get the entries for the current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentEntries = forecastData.slice(startIndex, endIndex);

    currentEntries.forEach(entry => {
        const date = new Date(entry.dt_txt).toLocaleDateString();
        const temp = entry.main.temp;

        const row = `<tr><td>${date}</td><td>${temp} °C</td></tr>`;
        forecastTableBody.insertAdjacentHTML('beforeend', row);
    });

    createPagination(totalPages);
}

// Function to create pagination
function createPagination(totalPages) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';  // Clear pagination container

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.classList.add('pagination-btn');
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }

        pageBtn.addEventListener('click', () => {
            currentPage = i; // Update current page
            displayTableData(forecastData); // Display data for the selected page
        });

        paginationContainer.appendChild(pageBtn);
    }
}

// Function to handle chatbot message sending
sendBtn.addEventListener('click', async () => {
    const message = chatInput.value;
    if (message.trim() !== '') {
        addMessageToChat('User', message);
        // Clear input field after sending
        chatInput.value = '';
        await chatbotReply(message); // Process user message through chatbot
    }
});

// Function to add messages to the chat box
function addMessageToChat(sender, message) {
    const messageElement = document.createElement('p');
    messageElement.classList.add(sender.toLowerCase());
    messageElement.textContent = `${sender}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;  // Scroll to the bottom of the chat
}

// Simulate a chatbot reply with weather integration
async function chatbotReply(userMessage) {
    const sanitizedMessage = userMessage ? userMessage.replace(/[^a-zA-Z0-9 .,?!]/g, '') : '';

    // Initial Bot response when chatbot starts
    if (!userMessage) {
        const initialMessage = `Hey there, ask me about the weather.`;
        addMessageToChat('Bot', initialMessage);
        return;
    }

    // Check if the message contains the keyword 'weather'
    if (sanitizedMessage.toLowerCase().includes('weather')) {
        const city = cityInput.value || 'Islamabad';  // Default city
        const weatherData = await getWeatherData(city);
        const summary = summarizeWeatherData(weatherData);

        const userQuery = `The user is asking about the weather data for ${city}. Here's the forecast: ${summary}. 
                           Question: ${sanitizedMessage}. 
                           Respond ONLY using the forecast passed only with concise, short sentences about the weather.`;

        const geminiResponse = await fetchGeminiResponse(userQuery);
        addMessageToChat('Bot', geminiResponse);
    } else {
        // Handle non-weather-related queries
        const city = cityInput.value || 'Islamabad';
        const nonWeatherResponse = `I can only answer questions about the weather for ${city}.; `;
        addMessageToChat('Bot', nonWeatherResponse);
    }
}

// Function to summarize weather data for Gemini chatbot
function summarizeWeatherData(forecastData) {
    // Summarize data to prevent overwhelming the user
    const summary = forecastData.slice(0, 3).map(entry => {
        const date = new Date(entry.dt_txt).toLocaleDateString();
        const temp = entry.main.temp;
        return `${date}: ${temp}°C`;
    }).join(', ');
    return summary;
}

// Function to fetch a response from the Gemini API using the SDK
async function fetchGeminiResponse(userMessage) {
    // Ensure the Gemini SDK is loaded
    if (!window.GoogleGenerativeAI) {
        const { GoogleGenerativeAI } = await import('https://esm.run/@google/generative-ai');
        window.GoogleGenerativeAI = GoogleGenerativeAI;
    }

    // Initialize genAI if not already initialized
    if (!genAI) {
        try {
            genAI = new window.GoogleGenerativeAI(API_KEY);
            console.log('Gemini initialized successfully');
        } catch (error) {
            console.error('Error initializing Gemini:', error);
            return 'Error initializing Gemini.';
        }
    }

    try {
        // Check if genAI has a valid model
        const model = genAI.getGenerativeModel ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;
        if (!model) {
            console.error('Failed to retrieve the generative model from Gemini.');
            return 'Unable to fetch Gemini response at the moment.';
        }

        const result = await model.generateContent([userMessage]);
        const response = await result.response.text();
        return response;  // Directly return the response text
    } catch (error) {
        console.error('Error fetching Gemini response:', error);
        return 'Sorry, I couldn\'t process your request.';
    }
}

// Event listener for fetching data when search button is clicked
searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        currentPage = 1;  // Reset to first page on new search
        getWeatherData(city);
    }
});
