document.addEventListener("DOMContentLoaded", async function () {
  const apiKey = '6667c176838bf8c6a2b1107478d51cc7';
  const cityInput = document.getElementById('cityInput');
  const searchBtn = document.getElementById('searchBtn');
  const cityNameElem = document.getElementById('cityName');
  const currentTempElem = document.getElementById('currentTemp');
  const tempRangeElem = document.getElementById('tempRange');
  const weatherIconElem = document.getElementById('weatherIcon');
  const feelsLikeElem = document.getElementById('feelsLike');
  const pressureElem = document.getElementById('pressure');
  const humidityElem = document.getElementById('humidity');
  const tempMinElem = document.getElementById('tempMin');
  const tempMaxElem = document.getElementById('tempMax');
  const windSpeedElem = document.getElementById('windSpeed');
  const celsiusBtn = document.getElementById('celsiusBtn');
  const fahrenheitBtn = document.getElementById('fahrenheitBtn');
  const loader = document.getElementById('loader');

  let unit = 'metric'; // Default to Celsius
  let barChart, doughnutChart, lineChart;

  // Set loading animation initially
  showLoader(true);

  // Fetch and display weather data when page loads for default city 'Islamabad'
  await fetchAndDisplayWeatherData('Islamabad');

  // Handle search button click
  searchBtn.addEventListener('click', async () => {
    await searchCity();
  });

  // Handle pressing "Enter" key on city input field
  cityInput.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
      await searchCity();
    }
  });

  // Handle unit toggle
  celsiusBtn.addEventListener('click', async () => {
    if (unit !== 'metric') {
      unit = 'metric';
      celsiusBtn.classList.add('active');
      fahrenheitBtn.classList.remove('active');
      await fetchAndDisplayWeatherData(cityInput.value || 'Islamabad');
    }
  });

  fahrenheitBtn.addEventListener('click', async () => {
    if (unit !== 'imperial') {
      unit = 'imperial';
      celsiusBtn.classList.remove('active');
      fahrenheitBtn.classList.add('active');
      await fetchAndDisplayWeatherData(cityInput.value || 'Islamabad');
    }
  });

  async function searchCity() {
    const city = cityInput.value;
    if (!city) {
      alert('Please enter a city name!');
      return;
    }
    await fetchAndDisplayWeatherData(city);
  }

  window.addEventListener('scroll', () => {
    const currentWeather = document.querySelector('.current-weather');
    if (window.scrollY > 150) {
        currentWeather.classList.add('shrunk');
        currentWeather.classList.add('shadow');
        currentWeather.style.backgroundColor = 'rgba(171, 180, 184, 0.95)';
        currentWeather.style.width = '50%';
        currentWeather.style.marginLeft = 'auto';
    } else {
        currentWeather.classList.remove('shrunk');
        currentWeather.style.removeProperty('background-color');
        currentWeather.style.removeProperty('width');
    }
});

  async function fetchAndDisplayWeatherData(city) {
    try {
      showLoader(true);
      const weatherData = await getWeatherData(city);
      displayWeatherData(weatherData);
      updateCharts(weatherData);
      displayForecastData(weatherData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      showLoader(false);
    }
  }

  async function getWeatherData(city) {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      if (error.response && error.response.status === 404) {
        alert('City not found');
      } else {
        alert('Network or server error');
      }
      throw error;
    }
  }

  function displayWeatherData(data) {
    const city = data.city.name;
    const weather = data.list[0];
    const tempUnit = unit === 'metric' ? '°C' : '°F';
  
    const temp = weather.main.temp;
    const feelsLike = weather.main.feels_like;
    const tempMin = weather.main.temp_min;
    const tempMax = weather.main.temp_max;
    const pressure = weather.main.pressure;
    const humidity = weather.main.humidity;
    const windSpeed = weather.wind.speed;
    const weatherDesc = weather.weather[0].description.toLowerCase();
    const weatherIcon = weather.weather[0].icon;
  
    const date = new Date();
    const hours = date.getHours();
    let icon_identifier = weatherIcon;
  
    if (hours >= 6 && hours <= 18) {
      if (weatherIcon.endsWith('n')) {
        icon_identifier = weatherIcon.replace('n', 'd');
      }
    } else {
      if (weatherIcon.endsWith('d')) {
        icon_identifier = weatherIcon.replace('d', 'n');
      }
    }
  
    const weatherIconUrl = `http://openweathermap.org/img/wn/${icon_identifier}@2x.png`;
  
    // Set background image based on weather description
    const currentWeatherSection = document.querySelector('.current-weather');
    let backgroundImage = '';
  
    if (weatherDesc.includes('clear')) {
      backgroundImage = 'url("assets/clear.jpg")';
    } else if (weatherDesc.includes('cloud')) {
      backgroundImage = 'url("assets/cloudy.jpg")';
    } else if (weatherDesc.includes('rain')) {
      backgroundImage = 'url("assets/rainy.jpg")';
    } else if (weatherDesc.includes('snow')) {
      backgroundImage = 'url("assets/snowy.jpg")';
    } else if (weatherDesc.includes('storm')) {
      backgroundImage = 'url("assets/stormy.jpg")';
    } else if (weatherDesc.includes('sun')) {
      backgroundImage = 'url("assets/sunny.jpg")';
    }
  
    currentWeatherSection.style.backgroundImage = backgroundImage;
    currentWeatherSection.style.backgroundSize = 'cover';
    currentWeatherSection.style.color = 'white';
    tempRangeElem.style.color = 'white';
    currentWeatherSection.style.backgroundRepeat = 'no-repeat';
    currentWeatherSection.style.backgroundPosition = 'center';
    currentWeatherSection.style.borderRadius = '12px'; // Add 12px border radius
    currentWeatherSection.style.overflow = 'hidden'; // Ensure the corners are clipped
  
    // Add gradient blur to the far right and left ends of currentWeatherSection
    const gradientOverlay = document.createElement('div');
    gradientOverlay.style.position = 'absolute';
    gradientOverlay.style.top = '0';
    gradientOverlay.style.left = '0';
    gradientOverlay.style.width = '100%';
    gradientOverlay.style.height = '100%';
    gradientOverlay.style.background = 'linear-gradient(to right, rgba(0, 0, 0, 0.3), transparent 30%, transparent 70%, rgba(0, 0, 0, 0.5))';
    gradientOverlay.style.pointerEvents = 'none'; // Ensure it doesn't interfere with other elements
  
    // Append the gradient overlay to the currentWeatherSection
    currentWeatherSection.appendChild(gradientOverlay);
    currentWeatherSection.style.backgroundRepeat = 'no-repeat';
    currentWeatherSection.style.backgroundPosition = 'center';
    currentWeatherSection.style.opacity = '1'; // Adjust the opacity as needed
  
    // Update other weather elements
    cityNameElem.textContent = city;
    currentTempElem.textContent = `${temp} ${tempUnit}`;
    tempRangeElem.textContent = `${tempMin} ${tempUnit} - ${tempMax} ${tempUnit}`;
    weatherIconElem.innerHTML = `<img src="${weatherIconUrl}" alt="${weatherDesc}">`;
    feelsLikeElem.textContent = `${feelsLike} ${tempUnit}`;
    pressureElem.textContent = `${pressure} hPa`;
    humidityElem.textContent = `${humidity} %`;
    tempMinElem.textContent = `${tempMin} ${tempUnit}`;
    tempMaxElem.textContent = `${tempMax} ${tempUnit}`;
    windSpeedElem.textContent = `${windSpeed} m/s`;
  }
  
  
  function displayForecastData(data) {
    const forecastContainer = document.getElementById('forecastDetails');
    forecastContainer.innerHTML = ''; // Clear any previous content
  
    const hourlyForecast = data.list.slice(0, 8); // Get the first 8 hours of forecast data
  
    hourlyForecast.forEach((hourData) => {
      const date = new Date(hourData.dt_txt);
      const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }); // Convert time to 12-hour format (AM/PM)
      const temperature = Math.round(hourData.main.temp);
      const weatherIcon = hourData.weather[0].icon; // Use the icon code provided by the API
      const description = hourData.weather[0].description;
  
      // Determine if it's a normal sunny time (6 AM to 6 PM considered day)
      const hours = date.getHours(); // Get the hour in 24-hour format
      let icon_identifier = weatherIcon; // Default to the provided icon
  
      // If the hour is between 6 AM and 6 PM, we consider it daytime (normally sunny)
      if (hours >= 6 && hours <= 18) {
          // If it's daytime and the weather is not clear, use night icon
          if (description.toLowerCase().includes("clear")) {
              icon_identifier = weatherIcon.replace(/n$/, 'd'); // Daytime icon
          } else {
              icon_identifier = weatherIcon.replace(/d$/, 'n'); // Nighttime icon (fallback)
          }
      } else {
          // If it's night (outside of 6 AM - 6 PM), use the night icon
          icon_identifier = weatherIcon.replace(/d$/, 'n'); // Night icon
      }
  
      // Create forecast item
      const forecastItem = document.createElement('div');
      forecastItem.classList.add('forecast-item');
  
      // Set content for each forecast item
      forecastItem.innerHTML = `
          <p>${time}</p> <!-- Show time in AM/PM format -->
          <img src="http://openweathermap.org/img/wn/${icon_identifier}.png" alt="${description}">
          <p>${temperature}°</p>
      `;
  
      // Append to container
      forecastContainer.appendChild(forecastItem);
    });
  }
  

  function showLoader(show) {
    loader.style.display = show ? 'block' : 'none';
  }

  function updateCharts(data) {
  const labels = data.list.slice(0, 5).map(item => new Date(item.dt_txt).toLocaleDateString());
  const temps = data.list.slice(0, 5).map(item => item.main.temp);

  // Bar Chart with delay animation
  const ctxBar = document.getElementById('barChart').getContext('2d');
  if (barChart) barChart.destroy();
  barChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: temps,
        backgroundColor: '#3498db'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      animation: {
        duration: 2000, // Animation duration in ms
        easing: 'easeInOutQuad', // Animation easing function
        delay: (context) => {
          return context.dataIndex * 300; // Delay between each bar
        }
      }
    }
  });

  // Doughnut Chart with delay animation
  const ctxDoughnut = document.getElementById('doughnutChart').getContext('2d');
  if (doughnutChart) doughnutChart.destroy();
  doughnutChart = new Chart(ctxDoughnut, {
    type: 'doughnut',
    data: {
      labels: ['Sunny', 'Cloudy'],
      datasets: [{
        data: [80, 20],
        backgroundColor: ['#f1c40f', '#95a5a6']
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 2000, // Animation duration in ms
        easing: 'easeInOutQuad', // Animation easing function
        delay: (context) => {
          return context.dataIndex * 300; // Delay between each slice
        }
      }
    }
  });

  // Line Chart with drop animation
  const ctxLine = document.getElementById('lineChart').getContext('2d');
  if (lineChart) lineChart.destroy();
  lineChart = new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: temps,
        borderColor: '#e74c3c',
        fill: false
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      animation: {
        duration: 2000, // Animation duration in ms
        easing: 'easeOutBounce', // Animation easing function
        onProgress: (animation) => {
          animation.chart.data.datasets.forEach((dataset, index) => {
            dataset.data.forEach((value, dataIndex) => {
              if (animation.currentStep === animation.numSteps - 1) {
                dataset.data[dataIndex] = 0; // Drop animation
              }
            });
          });
        }
      }
    }
  });
}

});
