let searchInp = document.querySelector('.weather__search');
let city = document.querySelector('.weather__city');
let day = document.querySelector('.weather__day');
let humidity = document.querySelector('.weather__indicator--humidity>.value');
let wind = document.querySelector('.weather__indicator--wind>.value');
let pressure = document.querySelector('.weather__indicator--pressure>.value');
let image = document.querySelector('.weather__image');
let temperature = document.querySelector('.weather__temperature>.value');
let forecastblock = document.querySelector('.weather__forecast');
let suggestions = document.querySelector('#suggestions');
let weatherAPIKey = '7e8f6277337760a2806c044a8a994b49';
let weatherBaseEndpoint = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + weatherAPIKey;
let forecastBaseEndpoint = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=' + weatherAPIKey;
let cityBaseEndpoint = 'https://api.teleport.org/api/cities/?search=';

let weatherImage = [
    {
        url : './images/clear_sky.png',
        id : [800]
    },
    {
        url : './images/scattered_clouds.png',
        id : [802]
    },
    {
        url : './images/cloudy.png',
        id : [801, 803, 804]
    },
    {
        url : './images/rain.png',
        id : [520, 521, 522, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321, 500, 501, 502, 503, 504]
    },
    {
        url : './images/thunderstorm.png',
        id : [200, 201, 202, 210, 211, 212, 221, 230, 231, 232]
    },
    {
        url : './images/snow.png',
        id : [511, 600, 601, 602, 611, 612, 615, 616, 620, 621, 622]
    },
    {
        url : './images/mist.png',
        id : [701, 711, 721, 731, 741, 751, 761, 762, 771, 781]
    }
]

let getWeatherByCityName = async (cityString) => {
    let city;
    if(cityString.includes(',')) {
        city = cityString.substring(0, cityString.indexOf(',')) + cityString.substring(cityString.lastIndexOf(','));
    }
    else {
        city = cityString;
    }
    let endpoint = weatherBaseEndpoint + '&q=' + city;
    let response = await fetch(endpoint);
    if(response.status !== 200) {
        alert('City not found!');
        return;
    }
    let weather = await response.json();
    return weather;
}

let getForcastbyCityID = async (id) => {
    let endpoint = forecastBaseEndpoint + '&id=' + id;
    let result = await fetch(endpoint);
    let forecast = await result.json();
    let forcastList = forecast.list;
    let daily = [];
    
    forcastList.forEach(day => {
        let date = new Date(day.dt_txt.replace(' ', 'T'));
        let hours = date.getHours();
        if(hours === 12) {
            daily.push(day);
        }
    })
    return daily;
}

let weatherforcity = async (city) => {
    let weather = await getWeatherByCityName(city);
    if(!weather) {
        return;
    }
    let cityID = weather.id;
    updatecurrentWeather(weather);
    let forcast = await getForcastbyCityID(cityID);
    updateForecast(forcast);
}
let init = () => {
    weatherforcity('Delhi').then(() => document.body.style.filter = 'blur(0px)');
}
init();
searchInp.addEventListener('keydown', async (e) => {
    if (e.keyCode === 13) {
        weatherforcity(searchInp.value);
    }
})

searchInp.addEventListener('input', async () => {
    let endpoint = cityBaseEndpoint + searchInp.value;
    let result = await (await fetch(endpoint)).json();
    suggestions.innerHTML = '';
    let cities = result._embedded['city:search-results'];
    let length = cities.length > 5 ? 5 : cities.length;
    for(let i = 0; i < length; i++) {
        let option = document.createElement('option');
        option.value = cities[i].matching_full_name;    
        suggestions.appendChild(option);
    }
    console.log(result);
})

let updatecurrentWeather = (data) => {
    console.log(data);
    city.textContent = data.name + ', ' + data.sys.country;
    day.textContent = DayOfWeek();
    humidity.textContent = data.main.humidity;
    pressure.textContent = data.main.pressure;
    let windDirection;
    let deg = data.wind.deg;
    if(deg > 45 && deg < 135) {
        windDirection = 'East';
    } else if(deg > 135 && deg < 225) {
        windDirection = 'South';
    } else if(deg > 225 && deg < 315) {
        windDirection = 'West';
    } else {
        windDirection = 'North';
    }
    wind.textContent = windDirection + ', ' + data.wind.speed;
    temperature.textContent = data.main.temp > 0 ?
                                '+' + Math.round(data.main.temp) :
                                Math.round(data.main.temp);
    let cur_img = weatherImage.find(item => item.id.includes(data.weather[0].id));
    image.src = cur_img.url;
}
let DayOfWeek = () => {
    return new Date().toLocaleDateString('en-EN', {'weekday': 'long'});
}
let updateForecast = (data) => {
    forecastblock.innerHTML = '';
    data.forEach(day => {
        let date = new Date(day.dt_txt.replace(' ', 'T'));
        let dayName = date.toLocaleDateString('en-EN', {'weekday': 'short'});
        let icon = weatherImage.find(item => item.id.includes(day.weather[0].id));
        let forecast = document.createElement('div');
        forecast.classList.add('weather__forecast__item');
        forecast.innerHTML = `
            <div class="weather__forecast-day">${dayName}</div>
            <img src="${icon.url}" alt="" class="weather__forecast__icon">
            <div class="weather__forecast-temperature">
                <span class="value">${Math.round(day.main.temp)}</span>
                <span class="symbol">°C</span>
            </div>
        `;
        forecastblock.appendChild(forecast);
        console.log(data);
    })
}