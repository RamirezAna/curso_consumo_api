//TODO
//* Lazy loading para favoritos o dos paginas diferentes, una para random y otra para favoritos
//*PAginacion de favoritos

const queryStringFav = [
  '?',
  'limit=15'
].join('');
const queryStringRandom = [
  '?',
  'limit=6'
].join('');

const API_KEY =   'live_x81Xaq29wMpSRAlSjcZsZbZM5wuauKMYYj2BxegwKvMnZfeApLsnIoDCtlkiJNqI';
const URL_RANDOM = `https://api.thecatapi.com/v1/images/search`;
const URL_FAVORITE = `https://api.thecatapi.com/v1/favourites`;
const API_URL_UPLOAD = `https://api.thecatapi.com/v1/images/upload`;

/*const moreCatsButton = document.querySelector('.moreButton');
moreCatsButton.addEventListener('click', getRandomCat);
*/
const randomColumns = [...document.querySelectorAll('.images-Container div[class^="column-"]')];
const favColumns = [...document.querySelectorAll('.fav-images-Container div[class^="column-"]')];

let RandomColumnsNum = 0;
let favColumnsNum = 0;
let firstLoad =false;

//*Con fetch
/* 
fetch(URL)
  .then(res => res.json())
  .then(data => {
    img.src = data[0].url;
  }) */

//!Peticion get a la API para obtener gatos Random
async function getRandomCat() {
  const res = await fetch(URL_RANDOM + queryStringRandom);
  const data = await res.json();

  console.log('Los gatos Random son:');
  console.log(data);

  for(let i = 0; i < data.length ; i++){
    if(RandomColumnsNum == 3){RandomColumnsNum = 0;};
    createImages(data[i].url, randomColumns[RandomColumnsNum], data[i].id, 'currentColor',false , 'images-Container');
    RandomColumnsNum++;
  }
};

//!Peticion get a la API para obtener los favoritos
async function getFavoriteCats(querys, print = true) {
  const res = await fetch(URL_FAVORITE + querys, {
    headers: {
      "content-type": "application/json",
      'x-api-key':`${API_KEY}`
    }
  });
  const data = await res.json();

  console.log('Los gatos fav son:');
  console.log(data);

  if (print) {
    if (firstLoad) {
      if(favColumnsNum == 3){favColumnsNum = 0;}
      createImages(data[data.length - 1].image.url, favColumns[favColumnsNum], data[data.length - 1].image_id, 'tomato',true, 'fav-images-Container');
      favColumnsNum++;
      console.log('nuevo gatito fav cargado');
    } else {
      
      for(let i = 0; i < data.length ; i++){
        if(favColumnsNum == 3){favColumnsNum = 0;}
        createImages(data[i].image.url, favColumns[favColumnsNum], data[i].image_id, 'tomato',true, 'fav-images-Container');
        favColumnsNum++;
        firstLoad = true;
        console.log('gatitos fav cargados');
      }
    }
  }
  return data;
};

//!LLamo a mis peticiones GET
getRandomCat(queryStringRandom);
getFavoriteCats(queryStringFav);

//!Funcion que crea las imagenes dentro de los contenedores
function createImages (urlImage, columnNum, id, heartColor,isFav, className){

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('imageContainer');
  imageContainer.innerHTML= `
  <svg class="corazon" data-id="${id}"width="150" height="150" viewbox="0 0 100 100" >
      <path fill="${heartColor}" d="M92.71,7.27L92.71,7.27c-9.71-9.69-25.46-9.69-35.18,0L50,14.79l-7.54-7.52C32.75-2.42,17-2.42,7.29,7.27v0 c-9.71,9.69-9.71,25.41,0,35.1L50,85l42.71-42.63C102.43,32.68,102.43,16.96,92.71,7.27z"></path>
  </svg>
  `;
  
  const image = document.createElement('img');
  image.classList.add('image');

  image.src = urlImage;
  imageContainer.appendChild(image);
  
  columnNum.appendChild(imageContainer);

  const SVGHeart = document.querySelector(`div.${className} svg[data-id='${id}']`);
  SVGHeart.addEventListener('click', saveFavoriteCat);

  if (isFav) {
    SVGHeart.classList.add('heart-beating')
    imageContainer.classList.add('favImage');
  }else{
    SVGHeart.classList.add('heart-stop')
  };
};

async function saveFavoriteCat (){
  const idCat= this.dataset.id;
  const path = this.children[0];
  const container = this.parentElement;
  const isFav = container.classList.contains('favImage');

  this.style.color = 'tomato'

  path.setAttribute('fill', 'currentColor');

  const validation = await getFavoriteCats(`?image_id=${idCat}`, false)

  console.log(validation);

  if (validation.length > 0 && isFav) {
    deleteFavoriteCat(validation[0].id, container);
    console.log('ya tenias guardado este gatito');

    this.style.color = '#908eb7'
    this.classList.remove('heart-beating');
    this.classList.add('heart-stop');
  
  }
  if(validation.length == 0) {
    this.classList.add('heart-beating');
    this.classList.remove('heart-stop');

    console.log('no tenias guardado este gatito');
    const res = await fetch(URL_FAVORITE, {
      method: 'POST',
      headers: {
        'x-api-key': `${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        {
          "image_id": `${idCat}`
        }
      )
    })
    await getFavoriteCats(`?image_id=${idCat}`, true);

    console.log('save');
    console.log(res);
  };

};
async function deleteFavoriteCat (id, imageContainer){
  const idCat = id

  const res = await fetch(`${URL_FAVORITE}/${idCat}` , {
    method: 'DELETE',
    headers: {
      'x-api-key': API_KEY
    }
  })

  imageContainer.remove();
  console.log(res);
}

async function uploadMichiPhoto(){
  const form = document.getElementById('uploadingForm');
  const formData = new FormData(form);

  const res = await fetch(API_URL_UPLOAD, {
    method: 'POST',
    headers: {
     /* 'Content-Type': 'multipart/formdata',*/
      'X-API-KEY':API_KEY,
    },
    body: formData,
  });

}
