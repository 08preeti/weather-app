const button = document.getElementById("getWeatherBtn");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");

const apiKey = "928d92628c00ea47c0239544428ba0d9";

// Button click
button.addEventListener("click", function () {
    const city = cityInput.value.trim();

    if (city === "") {
        weatherResult.innerHTML = "<p>Please enter a city name</p>";
        return;
    }

    // 1️⃣ Loading state
    weatherResult.innerHTML = "<p>Loading weather data...</p>";

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("City not found");
            }
            return response.json();
        })
        .then(data => {
            const temperature = data.main.temp;
            const description = data.weather[0].description;
            const icon = data.weather[0].icon;

            // 3️⃣ Temperature-based color
            let tempColor = "black";
            if (temperature > 30) tempColor = "red";
            else if (temperature < 15) tempColor = "blue";

            // 4️⃣ Date & Time
            const dateTime = new Date().toLocaleString();

            weatherResult.innerHTML = `
                <p><strong>City:</strong> ${city}</p>
                <p><strong>Temperature:</strong> 
                    <span style="color:${tempColor}">${temperature} °C</span>
                </p>
                <p><strong>Weather:</strong> ${description}</p>
                <p><strong>Updated:</strong> ${dateTime}</p>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather Icon">
            `;
        })
        .catch(error => {
            weatherResult.innerHTML = "<p>City not found. Please try again.</p>";
        });
});

// 2️⃣ Press ENTER to search
cityInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        button.click();
    }
});
