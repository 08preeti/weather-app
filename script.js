const button = document.getElementById("getWeatherBtn");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");

button.addEventListener("click", function () {
    const city = cityInput.value;

    if (city === "") {
        weatherResult.innerHTML = "<p>Please enter a city name</p>";
        return;
    }

    weatherResult.innerHTML = `
        <p>City: ${city}</p>
        <p>Fetching weather data...</p>
    `;
});

