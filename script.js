const button = document.getElementById("getWeatherBtn");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");
const unitToggle = document.getElementById("unitToggle");

const apiKey = "928d92628c00ea47c0239544428ba0d9"; // 🔑 Paste your OpenWeather API key here

let isCelsius = true;
let currentTempC = null;

// Fetch weather on button click
button.addEventListener("click", () => {
    const city = cityInput.value.trim();

    if (city === "") {
        weatherResult.innerHTML = "<p style='color:red'>Please enter a city name</p>";
        return;
    }

    fetchWeather(city);
});

// Fetch weather data from API
function fetchWeather(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error("City not found");
            return response.json();
        })
        .then(data => {
            currentTempC = data.main.temp;

            const description = data.weather[0].description;
            const icon = data.weather[0].icon;
            const weatherType = data.weather[0].main.toLowerCase();

            setBackground(weatherType, currentTempC);

            weatherResult.innerHTML = `
                <p><strong>City:</strong> ${data.name}</p>
                <p id="tempDisplay"><strong>Temperature:</strong> ${currentTempC.toFixed(1)} °C</p>
                <p><strong>Weather:</strong> ${description}</p>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather Icon">
            `;

            unitToggle.textContent = "Switch to °F";
            isCelsius = true;
        })
        .catch(() => {
            weatherResult.innerHTML = "<p style='color:red'>City not found. Please try again.</p>";
        });
}

// Temperature unit toggle
unitToggle.addEventListener("click", () => {
    if (currentTempC === null) return;

    const tempDisplay = document.getElementById("tempDisplay");

    if (isCelsius) {
        const tempF = (currentTempC * 9 / 5) + 32;
        tempDisplay.innerHTML = `<strong>Temperature:</strong> ${tempF.toFixed(1)} °F`;
        unitToggle.textContent = "Switch to °C";
    } else {
        tempDisplay.innerHTML = `<strong>Temperature:</strong> ${currentTempC.toFixed(1)} °C`;
        unitToggle.textContent = "Switch to °F";
    }

    isCelsius = !isCelsius;
});

// Accurate weather + temperature based background
function setBackground(weather, temp) {
    let bg = "images/default.jpg";

    // Weather condition priority
    if (weather.includes("rain") || weather.includes("drizzle")) {
        bg = "images/rain.jpg";
    }
    else if (weather.includes("snow")) {
        bg = "images/snow.jpg";
    }
    else {
        // Temperature ranges
        if (temp >= 30) {
            bg = "images/hot.jpg";
        }
        else if (temp >= 20 && temp < 30) {
            bg = "images/clear.jpg";
        }
        else if (temp >= 15 && temp < 20) {
            bg = "images/clouds.jpg";
        }
        else if (temp >= 5 && temp < 15) {
            bg = "images/cold.jpg";
        }
        else if (temp < 5) {
            bg = "images/snow.jpg";
        }
    }

    document.body.style.backgroundImage = `url('${bg}')`;
}

