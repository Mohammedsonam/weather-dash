const API_KEY = "replace your api key";

document.getElementById("searchBtn").addEventListener("click", getWeather);

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Please enter a city name!");

  try {
    const curRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`);
    if (!curRes.ok) throw new Error("City not found");
    const current = await curRes.json();

    const lat = current.coord.lat;
    const lon = current.coord.lon;
    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const forecast = await forecastRes.json();

    renderWeather(current, forecast);
  } catch (err) {
    document.getElementById("weatherCards").innerHTML = "<p>❌ Error fetching weather.</p>";
    document.getElementById("forecastBox").innerHTML = "";
    document.getElementById("weatherIcon").innerHTML = "";
    document.getElementById("weatherTip").innerText = "";
    console.error(err);
  }
}

function renderWeather(current, forecast) {
  const cardsEl = document.getElementById("weatherCards");
  const sunrise = new Date(current.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(current.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  cardsEl.innerHTML = `
    <div class="card"><h4>Temp</h4><p>${Math.round(current.main.temp)}°C</p></div>
    <div class="card"><h4>Feels Like</h4><p>${Math.round(current.main.feels_like)}°C</p></div>
    <div class="card"><h4>Humidity</h4><p>${current.main.humidity}%</p></div>
    <div class="card"><h4>Pressure</h4><p>${current.main.pressure} hPa</p></div>
    <div class="card"><h4>Wind</h4><p>${current.wind.speed} m/s ${degToCompass(current.wind.deg)}</p></div>
    <div class="card"><h4>Condition</h4><p>${current.weather[0].description}</p></div>
    <div class="card"><h4>Sunrise</h4><p>${sunrise}</p></div>
    <div class="card"><h4>Sunset</h4><p>${sunset}</p></div>
  `;

  let tip = "";
  const temp = current.main.temp;
  const desc = current.weather[0].description.toLowerCase();
  if (temp > 30) tip = "🔥 It's hot outside, stay hydrated!";
  else if (temp < 15) tip = "🧥 It's chilly, wear warm clothes.";
  else tip = "😊 The weather looks pleasant today!";
  if (desc.includes("rain")) tip = "☔ Don’t forget your umbrella!";
  if (desc.includes("thunder")) tip = "⚡ Stay indoors, thunderstorm alert!";
  document.getElementById("weatherTip").innerText = tip;

  const iconBox = document.getElementById("weatherIcon");
  iconBox.innerHTML = "";
  if (desc.includes("thunder")) {
    iconBox.innerHTML = `
      <div class="cloud cloud1"><span></span></div>
      <div class="cloud cloud2"><span></span></div>
      <div class="cloud cloud3"><span></span></div>
      <div class="thunder"><div class="bolt"></div></div>
    `;
  } else if (desc.includes("cloud")) {
    iconBox.innerHTML = `
      <div class="cloud cloud1"><span></span></div>
      <div class="cloud cloud2"><span></span></div>
      <div class="cloud cloud3"><span></span></div>
    `;
  } else if (desc.includes("rain")) {
    iconBox.innerHTML = `<div class="rain">
      <div class="drop" style="left:10px; animation-delay:0s;"></div>
      <div class="drop" style="left:30px; animation-delay:0.2s;"></div>
      <div class="drop" style="left:50px; animation-delay:0.4s;"></div>
      <div class="drop" style="left:70px; animation-delay:0.6s;"></div>
      <div class="drop" style="left:90px; animation-delay:0.8s;"></div>
    </div>`;
  } else {
    iconBox.innerHTML = `<div class="sun"></div>`;
  }

  const forecastEl = document.getElementById("forecastBox");
  forecastEl.innerHTML = "<h3>5-Day Forecast</h3>";
  const daily = {};
  forecast.list.forEach(item => {
    const day = new Date(item.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' });
    if (!daily[day]) daily[day] = item;
  });
  Object.values(daily).slice(0, 5).forEach(d => {
    const dayStr = new Date(d.dt * 1000).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const pop = Math.round((d.pop || 0) * 100);
    forecastEl.innerHTML += `
      <div class="f-day">
        <div class="small">${dayStr}</div>
        <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png" alt="${d.weather[0].description}" width="48" height="48"/>
        <div>${Math.round(d.main.temp)}°C</div>
        <div class="small">${d.weather[0].main}</div>
        <div class="small">POP: ${pop}%</div>
      </div>
    `;
  });
}

function degToCompass(num) {
  const val = Math.floor((num / 22.5) + 0.5);
  const arr = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return arr[(val % 16)];
}
