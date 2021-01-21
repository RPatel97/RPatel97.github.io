const worldURL = 'https://api.apify.com/v2/key-value-stores/tVaYRsPHLjNdNBu7S/records/LATEST?disableRedirect=true';
const canadaURL = 'https://api.apify.com/v2/key-value-stores/fabbocwKrtxSDf96h/records/LATEST?disableRedirect=true'
// fetch(worldURL)
// .then(data => data.json())
// .then(res => {
//     res.data.map(data => {
//         console.log(`${data.location}: ${data.latitude} ${data.longitude} ${data.confirmed}`);
//         return data;
//     });
//     console.log(" Data fetch successful.");
// });   

// async function getCovidAPI(URL) {

//   const response = await fetch(URL);

//   var data = await response.json();
//   console.log(data.data);

//   if(response) {
//     console.log("Data fetch Successful");
//   }
//   return (data.data);
// }

async function getCovidData(url) {
  const response = await fetch(url);
  const urlData = await response.json();
  var promise = new Promise(function(resolve, reject) {
    console.log(urlData);
    console.log('Data fetch successful.');
    resolve(urlData);
  });
  return promise;
}

var covidData = getCovidData(worldURL).then(promise=> {
  promise;
});

document.getElementById("CovidData").innerHTML = covidData;
