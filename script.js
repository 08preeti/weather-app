/*
  Skyline — Weather Instrument
  ----------------------------
  ⚠️ API key: OpenWeatherMap keys used from the browser are always visible to
  anyone who opens dev tools — there's no way to hide a client-side key.
  That's fine for a personal/demo project, but don't use a paid or rate-limited
  key here, and don't reuse this key elsewhere. For anything public-facing,
  proxy requests through a small backend that holds the key server-side.
*/
const API_KEY = "928d92628c00ea47c0239544428ba0d9";

const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const getWeatherBtn = document.getElementById("getWeatherBtn");
const geoBtn = document.getElementById("geoBtn");
const unitToggle = document.getElementById("unitToggle");
const weatherResult = document.getElementById("weatherResult");
const formError = document.getElementById("formError");
const skyEl = document.getElementById("sky");

let isCelsius = true;
let lastData = null; // holds the most recent successful API response

// ---------- Sky palettes: [top, mid, bottom] ----------
const SKY = {
  "clear-day":     ["#4fa7e0", "#7cc2e8", "#bfe3f5"],
  "clear-night":   ["#0b1526", "#16233c", "#24365a"],
  "clouds-day":    ["#7c8a99", "#97a4b1", "#b9c2cb"],
  "clouds-night":  ["#202a38", "#2b3648", "#3a475c"],
  "rain-day":      ["#45566b", "#56697f", "#6b7f94"],
  "rain-night":    ["#0f1720", "#182430", "#232f3c"],
  "storm-day":     ["#23202b", "#322c3f", "#423a55"],
  "storm-night":   ["#16131c", "#221d2b", "#2d2738"],
  "snow-day":      ["#b8c4cf", "#d3dee6", "#eef2f6"],
  "snow-night":    ["#1b2430", "#2a3341", "#3c4759"],
  "mist-day":      ["#8b93a0", "#a7aeb8", "#c7ccd2"],
  "mist-night":    ["#1c222b", "#2a323d", "#3a4450"],
  "default":       ["#1b2a44", "#2c4266", "#46618a"]
};

function skyKeyFor(main, isDay) {
  const m = main.toLowerCase();
  const suffix = isDay ? "day" : "night";
  if (m === "clear") return `clear-${suffix}`;
  if (m === "clouds") return `clouds-${suffix}`;
  if (m === "rain" || m === "drizzle") return `rain-${suffix}`;
  if (m === "thunderstorm") return `storm-${suffix}`;
  if (m === "snow") return `snow-${suffix}`;
  if (["mist", "smoke", "haze", "dust", "fog", "sand", "ash", "squall", "tornado"].includes(m)) {
    return `mist-${suffix}`;
  }
  return "default";
}

function paintSky(main, isDay) {
  const [top, mid, bottom] = SKY[skyKeyFor(main, isDay)] || SKY.default;
  skyEl.style.background = `linear-gradient(180deg, ${top} 0%, ${mid} 55%, ${bottom} 100%)`;
}

// ---------- Form submit ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();

  if (city === "") {
    showError("Enter a city name first.");
    return;
  }
  fetchWeatherByCity(city);
});

geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Location isn't available in this browser.");
    return;
  }
  setLoading(true);
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    () => {
      setLoading(false);
      showError("Couldn't get your location. Try searching instead.");
    }
  );
});

unitToggle.addEventListener("click", () => {
  if (!lastData) return;
  isCelsius = !isCelsius;
  renderReading(lastData);
});

// ---------- Fetching ----------
function fetchWeatherByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  runFetch(url);
}

function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  runFetch(url);
}

function runFetch(url) {
  setLoading(true);
  clearError();

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.status === 404 ? "City not found. Check the spelling and try again." : "Something went wrong fetching that reading.");
      }
      return response.json();
    })
    .then((data) => {
      lastData = data;
      unitToggle.disabled = false;
      renderReading(data);
    })
    .catch((err) => {
      showError(err.message || "Couldn't fetch the weather. Try again.");
    })
    .finally(() => setLoading(false));
}

// ---------- Rendering ----------
function renderReading(data) {
  const tempC = data.main.temp;
  const feelsC = data.main.feels_like;
  const main = data.weather[0].main;
  const description = data.weather[0].description;
  const icon = data.weather[0].icon;

  const sunriseMs = data.sys.sunrise * 1000;
  const sunsetMs = data.sys.sunset * 1000;
  const nowMs = data.dt * 1000;
  const isDay = nowMs >= sunriseMs && nowMs <= sunsetMs;

  paintSky(main, isDay);
  unitToggle.textContent = isCelsius ? "°C / °F" : "°F / °C";

  const temp = isCelsius ? tempC : cToF(tempC);
  const feels = isCelsius ? feelsC : cToF(feelsC);
  const unit = isCelsius ? "°C" : "°F";

  const windSpeed = data.wind?.speed ?? 0;
  const humidity = data.main.humidity;
  const pressure = data.main.pressure;
  const visibilityKm = data.visibility != null ? (data.visibility / 1000).toFixed(1) : "—";

  weatherResult.innerHTML = `
    <div class="reading__head">
      <div>
        <p class="reading__place">${escapeHtml(data.name)}, ${escapeHtml(data.sys.country || "")}</p>
        <p class="reading__desc">${escapeHtml(description)}</p>
      </div>
      <img class="reading__icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="">
    </div>

    <p class="reading__temp">${Math.round(temp)}<span style="font-size:28px;">${unit}</span></p>
    <p class="reading__feels">Feels like ${Math.round(feels)}${unit}</p>

    <hr class="hairline">

    <div class="grid">
      <div class="stat">
        <div class="stat__label">Humidity</div>
        <div class="stat__value">${humidity}%</div>
      </div>
      <div class="stat">
        <div class="stat__label">Wind</div>
        <div class="stat__value">${windSpeed} m/s</div>
      </div>
      <div class="stat">
        <div class="stat__label">Pressure</div>
        <div class="stat__value">${pressure} hPa</div>
      </div>
      <div class="stat">
        <div class="stat__label">Visibility</div>
        <div class="stat__value">${visibilityKm} km</div>
      </div>
    </div>

    <div class="arc-wrap">
      ${sunArcSvg(sunriseMs, sunsetMs, nowMs, isDay)}
      <div class="arc-times">
        <span>${formatTime(sunriseMs, data.timezone)}</span>
        <span>${isDay ? "Day" : "Night"}</span>
        <span>${formatTime(sunsetMs, data.timezone)}</span>
      </div>
    </div>
  `;
}

// ---------- Sun arc (signature element) ----------
// Draws a quadratic-bezier arc from sunrise to sunset and marks the sun's
// (or moon's) current position along it, based on real sunrise/sunset data.
function sunArcSvg(sunriseMs, sunsetMs, nowMs, isDay) {
  const P0 = { x: 20, y: 78 };
  const P1 = { x: 150, y: -6 };
  const P2 = { x: 280, y: 78 };

  let t;
  if (isDay) {
    t = (nowMs - sunriseMs) / (sunsetMs - sunriseMs);
  } else if (nowMs < sunriseMs) {
    // late night, before today's sunrise — approximate against a 12h night
    const priorSunset = sunsetMs - 24 * 60 * 60 * 1000;
    t = (nowMs - priorSunset) / (sunriseMs - priorSunset);
  } else {
    // after sunset — approximate against a 12h night
    const nextSunrise = sunriseMs + 24 * 60 * 60 * 1000;
    t = (nowMs - sunsetMs) / (nextSunrise - sunsetMs);
  }
  t = Math.min(1, Math.max(0, t));

  const x = (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x;
  const y = (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y;

  const bodyColor = isDay ? "#f2a65a" : "#dbe4ee";
  const glow = isDay ? "rgba(242,166,90,0.55)" : "rgba(219,228,238,0.4)";
  const pathColor = isDay ? "rgba(242,166,90,0.55)" : "rgba(219,228,238,0.3)";

  return `
    <svg viewBox="0 0 300 90" preserveAspectRatio="none">
      <path d="M${P0.x},${P0.y} Q${P1.x},${P1.y} ${P2.x},${P2.y}"
            fill="none" stroke="${pathColor}" stroke-width="1.5" stroke-dasharray="1 5" stroke-linecap="round" />
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="${glow}" />
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${bodyColor}" />
    </svg>
  `;
}

// ---------- Helpers ----------
function cToF(c) {
  return (c * 9) / 5 + 32;
}

function formatTime(ms, tzOffsetSeconds) {
  const localMs = ms + tzOffsetSeconds * 1000;
  const d = new Date(localMs);
  let hours = d.getUTCHours();
  const minutes = d.getUTCMinutes().toString().padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function setLoading(isLoading) {
  getWeatherBtn.disabled = isLoading;
  getWeatherBtn.querySelector(".btn-label").textContent = isLoading ? "Reading…" : "Get reading";
}

function showError(message) {
  formError.textContent = message;
}

function clearError() {
  formError.textContent = "";
}
