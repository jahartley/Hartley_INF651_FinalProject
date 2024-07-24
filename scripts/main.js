//Page Framework

const bodyEl = document.getElementById("body");



const mainContainerEl = document.getElementById("mainContainer");
const topMarkerEl = document.getElementById("topMarker");
let topPhotoPointer = 30;
let bottomPhotoPointer = 30;
let currentEl = null;
let currentId = null;

const defaultIndex = [];

for (let index = 0; index < photos.length; index++) {
  defaultIndex.push(index);
}

let inUseIndex = [...defaultIndex];


const uniqueTags = photos.filter((photo) => photo?.tags != undefined).map((photo) => photo.tags.map((tag) => tag)).flat().filter((value, index, currentValue) => currentValue.indexOf(value) === index);
const uniquePeople = photos.filter((photo) => photo?.people != undefined).map((photo) => photo.people.map((tag) => tag)).flat().filter((value, index, currentValue) => currentValue.indexOf(value) === index);

function combineTagsPeople(i) {
  let res = []
  photos[i].tags.map((tag) => res.push([tag, i]));
  photos[i].people.map((tag) => res.push([tag, i]));
  return res;
}

const searchMap = photos.map((photo, i) => (photo?.people != undefined) ? i : undefined).filter(x => x != undefined).flatMap((i) => combineTagsPeople(i));

function searchArr(arr) {
  return searchMap.filter((item) => arr.includes(item[0])).map((item) => item[1]).filter((value, index, currentValue) => currentValue.indexOf(value) === index);;
}


//inUseIndex = [...searchArr(["Judson", "theBeast"])]

//console.log(inUseIndex);

let ioOptions = {
  root: mainContainerEl,
  rootMargin: "0px",
  threshold: 1.0,
};

let ioObserver = new IntersectionObserver(ioCallback, ioOptions);

let lastIoEl = null;
function ioCallback (entries, ioObserver) {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    let idS2 = parseInt(entry.target.id.substring(3), 10);
    currentEl = entry.target;
    currentId = idS2;
    updateAll();
    if (entry.target.previousElementSibling == topMarkerEl) {
      infoBox("No older photos found");
      console.log("FOUND THE TOP!");
    }
    if (entry.target.nextElementSibling == null) {
      infoBox("No newer photos found");
      console.log("FOUND THE BOTTOM!");
    }
    loadRange(idS2, entry.target);
  });
}

let photoElList = [];
function loadImageArr() {
  if (photoElList.length == 0) return;
  loadImage(photoElList.shift());
}

function loadImage(target) {
  if (!target.firstChild.classList.contains("lazy")) return;
  target.firstChild.src = target.firstChild.dataset.src;
  target.firstChild.classList.remove("lazy");
}

function loadRange(idS, target) {
  if (idS - 3 < topPhotoPointer && idS >= 0) addPhotoTop(target);
  if (idS + 3 >= bottomPhotoPointer && idS < inUseIndex.length) addPhotoBottom(target);
}

/**
 * adds a photo to the DOM, by number from photos object.
 * @param {*} number which photo from photos to add
 * @param {*} element which element to use for the reference
 * @param {*} where 'beforebegin': Before the targetElement itself.
 * 'afterbegin': Just inside the targetElement, before its first child.
 * 'beforeend': Just inside the targetElement, after its last child.
 * 'afterend': After the targetElement itself.
 */
function addPhoto(number, element, where){
  const photo = document.getElementById("photoBoxTemplate").content.cloneNode(true);
  photo.children[0].id = 'pic'+ inUseIndex[number];
  photo.children[0].firstChild.dataset.src = `images/testPics/${photos[inUseIndex[number]].File.FileName}`;
  element.insertAdjacentElement(where, photo.children[0]);
  const result = document.getElementById('pic'+ inUseIndex[number]);
  ioObserver.observe(result);
  (function(tgt){
    setTimeout(() => {
      loadImage(tgt);
    }, 100 + getRandomInt(30));
  })(result);
  return result;
}

let snapScrollTimeout;
function setSnapScrollTimeout() {
  clearTimeout(snapScrollTimeout);
  snapScrollTimeout = setTimeout(() => {
    mainContainerEl.classList.add("snapScroll");
  }, 300);
}

function addPhotoTop(target, many = 5){
  if (topPhotoPointer <= 0) return;
  clearTimeout(snapScrollTimeout);
  mainContainerEl.classList.remove("snapScroll");
  for (let i = 0; i < many; i++) {
    topPhotoPointer--;
    if (topPhotoPointer < 0) {
      topPhotoPointer = 0;
      //infoBox("No older photos found");
      setSnapScrollTimeout();
      return;
    }
    addPhoto(topPhotoPointer, topMarkerEl, 'afterend');
    scrollToTarget(target);
  }
  scrollToTarget(target);
  setSnapScrollTimeout();
}

function addPhotoBottom(target, many = 5){
  if (bottomPhotoPointer + 1 >= inUseIndex.length) return;
  clearTimeout(snapScrollTimeout);
  mainContainerEl.classList.remove("snapScroll");
  for (let i = 0; i < many; i++) {
    bottomPhotoPointer++;
    if (bottomPhotoPointer >= inUseIndex.length) {
      //infoBox("No newer photos found");
      bottomPhotoPointer = inUseIndex.length - 1;
      setSnapScrollTimeout();
      return;
    }
    addPhoto(bottomPhotoPointer, mainContainerEl, 'beforeend');
    scrollToTarget(target);
  }
  scrollToTarget(target);
  setSnapScrollTimeout();
}

function scrollToTarget(target){
  if (target != undefined || target != null) {
    let El = document.getElementById(target.id);
    let box = El.offsetTop;
    mainContainerEl.scroll({
      top: (box-30),
      left: 0,
      behavior: "instant",
    });
  }
}

const infoEl = document.getElementById("infoBox");
const photoInfoEl = document.getElementById("photoInfo");
const photoTagsEl = document.getElementById("photoTags");
const photoPeopleEl = document.getElementById("photoPeople");

infoEl.addEventListener('click', () => {
  infoEl.classList.add("hidden");
});

photoInfoEl.addEventListener('click', () => {
  photoInfoEl.classList.add("hidden");
});

photoTagsEl.addEventListener('click', () => {
  photoTagsEl.classList.add("hidden");
});

photoPeopleEl.addEventListener('click', () => {
  photoPeopleEl.classList.add("hidden");
});

function popUpHideAll(){
  document.querySelectorAll(".hideAll").forEach((el) => el.classList.add("hidden"));
}

//show the infoBox modal
const infoTextEl = document.getElementById("infoText");
function infoBox(msg){
  popUpHideAll();
  document.querySelector("#infoBox > div > h2").textContent = msg;
  infoEl.classList.remove("hidden");
  //infoTextEl.innerText = msg;
}

function updateAll() {
  updateTags();
  updatePeople();
}

function updateTags() {
  document.querySelectorAll(".tagsInfo > .tag").forEach(el => el.remove());
  if (photos[currentId]?.tags == undefined) return;
  document.querySelectorAll(".tagsInfo").forEach(el => el.innerHTML = el.innerHTML + photos[currentId].tags.reduce((acc, data) => acc + `<span class="tag" name="tag_${data}">${data}</span>`,""));
}

function updatePeople() {
  document.querySelectorAll(".peopleInfo > .people").forEach(el => el.remove());
  if (photos[currentId]?.people == undefined) return;
  document.querySelectorAll(".peopleInfo").forEach(el => el.innerHTML = el.innerHTML + photos[currentId].people.reduce((acc, data) => acc + `<span class="people" name="people_${data}">${data}</span>`,""));
}


//get a random integer from 0 to max
function getRandomInt(max){
  return Math.floor((Math.random() * max));
}


document.addEventListener("readystatechange", (event) => {
  if (event.target.readyState === "interactive") {
    console.log("interactive");
    loginSuccess();
  } else if (event.target.readyState === "complete") {
    console.log("complete");
    let randomPic = getRandomInt(photos.length);
    topPhotoPointer = randomPic;
    bottomPhotoPointer = randomPic;
    console.log(`loading first ${randomPic}`);
    targetEl = addPhoto(randomPic,mainContainerEl,'beforeend');
    loadRange(randomPic, targetEl);
    document.body.addEventListener('click', bodyClickWatch, true);
  }
});

function bodyClickWatch(event){
  //console.log(event);
  if (currentEl.contains(event.target)) {
    console.log("clicked current pic");
    return;
  }
  if (document.getElementById("footerNav").contains(event.target)) {
    console.log("clicked bottom nav");
    return;
  }
  let elements = document.querySelectorAll(".tag");
  elements.forEach((el) => {
    if (el.contains(event.target)) console.log(el.getAttribute("name"));
  });
}

function loginSuccess() {
  const navFooterEl = document.getElementById("navFooterTemplate").content.cloneNode(true);
  let tempEl, tempEl2;

  //add svg

  tempEl = navFooterEl.querySelector("#navSearchDate");
  tempEl2 = document.querySelector("template.svgCalendar").content.cloneNode(true);
  console.log(tempEl2);
  tempEl2.querySelector("title").textContent = "Search by Date";
  tempEl.appendChild(tempEl2.children[0]);

  tempEl = navFooterEl.querySelector("#navSearchPeople");
  tempEl2 = document.querySelector("template.svgPeople").content.cloneNode(true);
  tempEl2.querySelector("title").textContent = "Search for People";
  tempEl.appendChild(tempEl2.children[0]);
  
  tempEl = navFooterEl.querySelector("#navSearchAll");
  tempEl2 = document.querySelector("template.svgSearch").content.cloneNode(true);
  tempEl2.querySelector("title").textContent = "Search All Choices";
  tempEl.appendChild(tempEl2.children[0]);

  tempEl = navFooterEl.querySelector("#navSearchTags");
  tempEl2 = document.querySelector("template.svgTag").content.cloneNode(true);
  tempEl2.querySelector("title").textContent = "Search by Tag";
  tempEl.appendChild(tempEl2.children[0]);
  
  tempEl = navFooterEl.querySelector("#navSearchStar");
  tempEl2 = document.querySelector("template.svgStar").content.cloneNode(true);
  tempEl2.querySelector("title").textContent = "Search by Rating";
  tempEl.appendChild(tempEl2.children[0]);

  tempEl = navFooterEl.querySelector("#navTag");
  tempEl2 = document.querySelector("template.svgTag").content.cloneNode(true);
  tempEl2.querySelector("title").textContent = "Show Tags";
  tempEl.prepend(tempEl2.children[0]);

  tempEl = navFooterEl.querySelector("#navInfo");
  tempEl2 = document.querySelector("template.svgInfo").content.cloneNode(true);
  tempEl2.querySelector("title").textContent = "Show Info";
  tempEl.prepend(tempEl2.children[0]);

  tempEl = navFooterEl.querySelector("#navLocation");
  tempEl2 = document.querySelector("template.svgEarth").content.cloneNode(true);
  tempEl2.querySelector("title").textContent = "Show Location on Google Maps";
  tempEl.prepend(tempEl2.children[0]);

  tempEl = navFooterEl.querySelector("#navPeople");
  tempEl2 = document.querySelector("template.svgPeople").content.cloneNode(true);
  tempEl2.querySelector("title").textContent = "Show People";
  tempEl.prepend(tempEl2.children[0]);

  tempEl = navFooterEl.querySelector("#navActive");
  tempEl2 = document.querySelector("template.svgCancel").content.cloneNode(true);
  tempEl2.querySelector("title").textContent = "Open or Close Search Menu";
  tempEl.appendChild(tempEl2.children[0]);

  tempEl = document.querySelectorAll(".tagsInfo");
  tempEl2 = document.querySelector("template.svgTag").content.cloneNode(true);
  tempEl2.querySelector("title").textContent = "Image Tags";
  tempEl.forEach((el) => el.prepend(tempEl2.cloneNode(true).children[0]));

  tempEl = document.querySelectorAll(".peopleInfo");
  tempEl2 = document.querySelector("template.svgPeople").content.cloneNode(true);
  tempEl2.querySelector("title").textContent = "People in the Photo";
  tempEl.forEach((el) => el.prepend(tempEl2.cloneNode(true).children[0]));

  tempEl = document.querySelectorAll(".imageInfo");
  tempEl2 = document.querySelector("template.svgImage").content.cloneNode(true);
  tempEl2.querySelector("title").textContent = "Image Information";
  tempEl.forEach((el) => el.prepend(tempEl2.cloneNode(true).children[0]));

  tempEl = document.querySelectorAll(".cameraInfo");
  tempEl2 = document.querySelector("template.svgCamera").content.cloneNode(true);
  tempEl2.querySelector("title").textContent = "Camera Information";
  tempEl.forEach((el) => el.prepend(tempEl2.cloneNode(true).children[0]));



  const clickElements = navFooterEl.querySelectorAll(".navBtn");
  clickElements.forEach((el) => {
    el.addEventListener('click', () => {navClick(el.id)})});

  function navClick(target) {
    console.log(target);
    if (target == 'navLocation') {
      if (currentId == null) return; 
      if (photos2[currentId]?.Composite?.GPSLatitude == undefined) return;
      if (photos2[currentId]?.Composite?.GPSLongitude == undefined) return;
      window.open(`https://www.google.com/maps/search/?api=1&query=${photos2[currentId]?.Composite?.GPSLatitude}%2C${photos2[currentId]?.Composite?.GPSLongitude}`);
      return;
    }
    if (target == 'navInfo') {
      popUpHideAll();
      photoInfoEl.classList.remove("hidden");
      return;
    }
    if (target == 'navTag') {
      popUpHideAll();
      photoTagsEl.classList.remove("hidden");
      return;
    }
    if (target == 'navPeople') {
      popUpHideAll();
      photoPeopleEl.classList.remove("hidden");
      return;
    }
  }
  
  const navBtnEl = navFooterEl.querySelector("#navActive");
  const navEl = navFooterEl.querySelector(".nav-collapse");
  const navBoxesEl = navFooterEl.querySelectorAll(".nav-collapse .box");
  navBtnEl.addEventListener("click", () => {
    navBtnEl.classList.toggle("active");
    if (navEl.classList.contains("active")) {
      navBoxesEl.forEach((box) => {
        box.classList.remove("active");
      });
      navEl.style.width = `6rem`;
      setTimeout(() => {
        navEl.classList.remove("active");
      }, 500);
    } else {
      navEl.classList.add("active");
      setTimeout(() => {
        navEl.style.width = `40rem`;
        navBoxesEl.forEach((box) => {
          box.classList.add("active");
        });
      }, 500);
    }
  });

  // const navInfoEl = document.getElementById("navInfo");
  // navInfoEl.addEventListener("click", () =>{
  //   //https://www.google.com/maps/search/?api=1&query=47.5951518%2C-122.3316393
  // });

  // const navPeopleEl = document.getElementById("navPeople");
  // navPeopleEl.addEventListener("click", () =>{
  //   //https://www.google.com/maps/search/?api=1&query=47.5951518%2C-122.3316393
  // });

  // const navTagEl = document.getElementById("navTag");
  // navTagEl.addEventListener("click", () =>{
  //   //https://www.google.com/maps/search/?api=1&query=47.5951518%2C-122.3316393
  // });

  // const navLocationEl = document.getElementById("navLocation");
  // navLocationEl.addEventListener("click", () => {
  //   if (currentId == null) return; 
  //   if (photos2[currentId]?.Composite?.GPSLatitude == undefined) return;
  //   if (photos2[currentId]?.Composite?.GPSLongitude == undefined) return;
  //   window.open(`https://www.google.com/maps/search/?api=1&query=${photos2[currentId]?.Composite?.GPSLatitude}%2C${photos2[currentId]?.Composite?.GPSLongitude}`);
  // });
  document.getElementById("footerNav").insertAdjacentElement("beforeend", navFooterEl.children[0]);
}



