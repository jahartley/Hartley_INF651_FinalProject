//Page Framework

const bodyEl = document.getElementById("body");



const mainContainerEl = document.getElementById("mainContainer");
const topMarkerEl = document.getElementById("topMarker");
let topPhotoPointer = 30;
let bottomPhotoPointer = 30;
let currentEl = null;
let currentId = null;

const defaultIndex = [];
const defaultIndexDateUnix = [];
let filters = [];

for (let index = 0; index < photos.length; index++) {
  defaultIndex.push(index);
}

let inUseIndex = [...defaultIndex];

for (let index = 0; index < photos.length; index++) {
  defaultIndexDateUnix.push(getDateExif(index));
}

const uniqueTags = photos.filter((photo) => photo?.tags != undefined).map((photo) => photo.tags.map((tag) => tag)).flat().filter((value, index, currentValue) => currentValue.indexOf(value) === index);
const uniquePeople = photos.filter((photo) => photo?.people != undefined).map((photo) => photo.people.map((tag) => tag)).flat().filter((value, index, currentValue) => currentValue.indexOf(value) === index);

function combineTagsPeople(i) {
  let res = []
  photos[i].tags.map((tag) => res.push([tag, i]));
  photos[i].people.map((tag) => res.push([tag, i]));
  return res;
}

const searchMap = photos.map((photo, i) => (photo?.people != undefined) ? i : undefined).filter(x => x != undefined).flatMap((i) => combineTagsPeople(i));

function searchArr() {
  return searchMap.filter((item) => filters.includes(item[0])).map((item) => item[1]).filter((value, index, currentValue) => currentValue.indexOf(value) === index);
}

function tagSearch() {
  let photoId = currentId;
  console.log(`currentId ${currentId} inUseIndex index ${inUseIndex.indexOf(currentId)}`);
  let result = searchArr();
  console.log(result);
  if (result.length == 0) inUseIndex = [...defaultIndex]; else inUseIndex = [...result];
  clearPhotos();
  loadFirstPhoto(inUseIndex.indexOf(photoId));
  updateFilter();
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

// let photoElList = [];
// function loadImageArr() {
//   if (photoElList.length == 0) return;
//   loadImage(photoElList.shift());
// }

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
  // console.log(inUseIndex);
  // console.log(photos[inUseIndex[number]]);
  // console.log(number);
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

function popUpHideAll(){
  document.querySelectorAll(".hideAll").forEach(el => el.classList.add("hidden"));
}

function showInfo(classId) {
  console.log(`showInfo ${classId}`);
  document.querySelectorAll(classId).forEach(el => el.classList.remove("hidden"));
}

function hideInfo(classId) {
  console.log(`hideInfo ${classId}`);
  document.querySelectorAll(classId).forEach(el => el.classList.add("hidden"));
}

//show the infoBox modal
function infoBox(msg){
  popUpHideAll();
  document.querySelector(".infoBox > div > h2").textContent = msg;
  showInfo(".infoBox");
}

function updateAll() {
  updateTags();
  updatePeople();
}

function updateFilter() {
  document.querySelectorAll(".filters > .filter").forEach(el => el.remove());
  if (filters.length == 0) {
    hideInfo("#filterTagsBox");
    return;
  }
  filters.forEach(item => document.querySelectorAll(".filters").forEach(el => el.innerHTML = el.innerHTML + `<span class="filter" name="filter_${item}">${item}</span>`));
  showInfo("#filterTagsBox");
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
    loadFirstPhoto();
    document.body.addEventListener('click', bodyClickWatch, true);
  }
});


//===================== Click events ===================================
  
// use common click handler to catch pointerdown events. Contains should
// go from smallest elements to largest...
function bodyClickWatch(event){
  //console.log(event);
  let elements = document.querySelectorAll(".tag, .people");
  for ( const el of elements) {
    if (el.contains(event.target)) {
      //console.log(el.getAttribute("name"));
      tagClicked(el.getAttribute("name"));
      return;
    }
  }
  elements = document.querySelectorAll(".filter");
  for ( const el of elements) {
    if (el.contains(event.target)) {
      //console.log(el.getAttribute("name"));
      filterClicked(el.getAttribute("name"));
      return;
    }
  }
  elements = document.querySelectorAll(".navBtn");
  for ( const el of elements) {
    if (el.contains(event.target)) {
      //console.log(`navBtn Click ${el.getAttribute("id")}`);
      navBtnClicked(el.getAttribute("id"));
      return;
    }
  }

  elements = document.querySelectorAll(".noClick");
  for ( const el of elements) {
    if (el.contains(event.target)) {
      console.log(`noClick ${el}`);
      return;
    }
  }

  elements = document.querySelectorAll(".modal, .topMsg");
  for ( const el of elements) {
    if (el.contains(event.target)) {
      console.log(el.getAttribute("id"));
      popUpHideAll();
      return;
    }
  }
  if (currentEl.contains(event.target)) {
    console.log("clicked current pic");
    return;
  }
}

//handle tags and people tags clicked.
function tagClicked(name){
  console.log(name);
  filters.push(name.split("_")[1]);
  tagSearch();
}

function filterClicked(name){
  console.log(`filter remove clicked ${name}`);
  let index = filters.indexOf(name.split("_")[1]);
  if (index == -1) return;
  filters.splice(index, 1);
  tagSearch();
}

//handle navBtn clicks
function navBtnClicked(btn){
  console.log(btn);
  if (btn == null) return;
  if (btn == "navActive") {
    if (document.querySelector(".nav-collapse").classList.contains("active")) navHide(); else navShow();
    return;
  }
  if (btn == "navSearchDate") {
    popUpHideAll();
    showInfo(".searchDateBox");
    navHide();
    return;
  }
  if (btn == "navSearchPeople") {
    popUpHideAll();
    showInfo(".searchPeopleBox");
    navHide();
    return;
  }
  if (btn == "navSearchAll") {
    popUpHideAll();
    showInfo(".searchAllBox");
    navHide();
    return;
  }
  if (btn == "navSearchTags") {
    popUpHideAll();
    showInfo(".searchTagsBox");
    navHide();
    return;
  }
  if (btn == "navSearchStar") {
    popUpHideAll();
    showInfo(".searchStarsBox");
    navHide();
    return;
  }
  if (btn == 'navInfo') {
    popUpHideAll();
    showInfo(".allInfo");
    return;
  }
  if (btn == 'navTag') {
    popUpHideAll();
    showInfo("#photoTagsBox");
    return;
  }
  if (btn == 'navPeople') {
    popUpHideAll();
    showInfo("#photoPeopleBox");
    return;
  }
  if (btn == "dateSearchGo") {
    let el = document.getElementById("searchDateBox");
    let dateValue = el.querySelector("input").value;
    dateValue = Date.parse(dateValue);
    let index;
    for (index = 0; index < inUseIndex.length; index++) {
      console.log(getDateExif(index) - dateValue);
      if (dateValue < getDateExif(index)) break;      
    }
    clearPhotos();
    // set inUseIndex to all photos...
    inUseIndex = [...defaultIndex];
    loadFirstPhoto(index);
    el.classList.add("hidden");
    return;
  }
  if (btn == 'navLocation') {
    if (currentId == null) return; 
    if (photos2[currentId]?.Composite?.GPSLatitude == undefined) return;
    if (photos2[currentId]?.Composite?.GPSLongitude == undefined) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${photos2[currentId]?.Composite?.GPSLatitude}%2C${photos2[currentId]?.Composite?.GPSLongitude}`);
    return;
  }
}

function getDateExif(id) {
  let pId = inUseIndex[id];
  if (photos2[pId]?.EXIF?.CreateDate == undefined || photos2[pId]?.EXIF?.OffsetTime == undefined) return undefined;
  let dateString = photos2[pId].EXIF.CreateDate.split(/:| /)[0];
  dateString += "-";
  dateString += photos2[pId].EXIF.CreateDate.split(/:| /)[1];
  dateString += "-";
  dateString += photos2[pId].EXIF.CreateDate.split(/:| /)[2];
  dateString += "T";
  dateString += photos2[pId].EXIF.CreateDate.split(" ")[1];
  dateString += ".000";
  dateString += photos2[pId].EXIF.OffsetTime;
  console.log(dateString);
  return Date.parse(dateString);
}


function clearPhotos(){
  document.querySelectorAll('.photobox').forEach(e => e.remove());
}

function loadFirstPhoto(index){
  if (index == undefined || index == null) {
    index = getRandomInt(inUseIndex.length);
  }
  topPhotoPointer = bottomPhotoPointer = index;
  console.log(`loading first ${index}`);
  resEl = addPhoto(index,mainContainerEl,'beforeend');
  loadRange(index, resEl);
}



function navShow(){
  let navBtnEl = document.querySelector("#navActiveBtn");
  let navEl = document.querySelector(".nav-collapse");
  let navBoxesEl = document.querySelectorAll(".nav-collapse .box");
  navEl.classList.add("active");
  navBtnEl.classList.add("active");
  setTimeout(() => {
    navEl.style.width = `40rem`;
    navBoxesEl.forEach((box) => {
      box.classList.add("active");
    });
  }, 500);
}
function navHide(){
  let navBtnEl = document.querySelector("#navActiveBtn");
  let navEl = document.querySelector(".nav-collapse");
  let navBoxesEl = document.querySelectorAll(".nav-collapse .box");
  navBoxesEl.forEach((box) => {
    box.classList.remove("active");
  });
  navBtnEl.classList.remove("active");
  navEl.style.width = `6rem`;
  setTimeout(() => {
    navEl.classList.remove("active");
  }, 500);
}

function loginSuccess() {
  const navFooterEl = document.getElementById("navFooterTemplate").content.cloneNode(true);
    
  let tempEl, tempEl2;

  //add svgs

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

  tempEl = navFooterEl.querySelector("#navActiveBtn");
  tempEl2 = document.querySelector("template.svgCancel").content.cloneNode(true);
  tempEl2.querySelector("title").textContent = "Open or Close Search Menu";
  tempEl.appendChild(tempEl2.children[0]);

  tempEl = document.querySelectorAll(".tagsInfo, .filters");
  tempEl2 = document.querySelector("template.svgTag").content.cloneNode(true);
  tempEl2.querySelector("title").textContent = "Image Tags";
  tempEl.forEach((el) => el.prepend(tempEl2.cloneNode(true).children[0]));

  tempEl = document.querySelectorAll(".peopleInfo, .filters");
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

  // add all to dom
  document.getElementById("footerNav").insertAdjacentElement("beforeend", navFooterEl.children[0]);
}



