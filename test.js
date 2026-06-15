var fs = new ActiveXObject("Scripting.FileSystemObject");
var adhanContent = fs.OpenTextFile("js/adhan.js", 1).ReadAll();
eval(adhanContent);

var state = { lat: 21.4225, lng: 39.8262, method: 3, school: 0 };
var date = new Date();
var coordinates = new adhan.Coordinates(Number(state.lat), Number(state.lng));
var params = adhan.CalculationMethod.MuslimWorldLeague();
params.madhab = adhan.Madhab.Shafi;
var prayerTimes = new adhan.PrayerTimes(coordinates, date, params);
WScript.Echo(prayerTimes.fajr);
WScript.Echo(new adhan.SunnahTimes(prayerTimes).lastThirdOfTheNight);
