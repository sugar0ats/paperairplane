var grats = [];
var currentAirplanes = [];
var name;
var uploadedDataPoints = [name, currentAirplanes, grats];

function preload() {
  paperAirplane = loadImage('arrow-placeholder.png');
}

function setup() {

  var firebaseConfig = {
    apiKey: "AIzaSyCVEIBTfUeGmzXWB0kHCFtky0PAqN9SLFw",
    authDomain: "paperplane-79052.firebaseapp.com",
    projectId: "paperplane-79052",
    storageBucket: "paperplane-79052.appspot.com",
    messagingSenderId: "523526921107",
    appId: "1:523526921107:web:50266ebff6fc08a7616666",
    measurementId: "G-C0TEK0NF2G"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  console.log(firebase);

  var database = firebase.database();
  var ref = database.ref('accounts');


  planeStatus();
  var currentDate = makeDate();

  grats.push([currentDate]);

  var writeButton = select('.button write');
  writeButton.mousePressed(sendMessage);
  var letterImage = select('.letterImage');
  var writeBox = select('.writeBox');
  var letterStarterText = select('.letterStarter');
  //writeBox.hide();
  //letterImage.hide();
  var letter = [letterImage, writeBox, letterStarterText];

  var leftPage = select('.page left');
  var rightPage = select('.page right');
  var journalImage = select('.journalImage');
  var journalButton = select('.button journal');
  var rightArrow = select('.arrow next');
  var leftArrow = select('.arrow back');
  var journal = [journalImage, leftPage, rightPage, leftArrow, rightArrow];

  var returnImage = select('.returnImage');
  var returnText = select('.returnText');
  var returnEl = [returnImage, returnText];

  var returnPlane = select('.plane moving');
  var returnPausePlane = select('.plane static');

  var nameBox = select('.nameBox');
  var confirmNameBut = select('.confirmNameBut');
  var startImage = select('.startImage');
  var instructions = select('.instructions');
  var start = [nameBox, confirmNameBut, startImage, instructions];

  returnPlane.hide();
  returnPausePlane.hide();
  returnPlane.style('opacity', 0);
  returnPausePlane.style('opacity', 0);


  journalButton.mousePressed(drawJournal);
  confirmNameBut.mousePressed(getName);


  var journalOut = false;
  var returnPaperOut = false;
  var paperOut = false;
  var currentSeenPage = 0;
  var planeTime;

  function getName() {
    name = nameBox.value();
    fadeEverythingStart('out');
    setTimeout(() => start.map((element) => element.hide()), 500);
    uploadToDataBase(name, currentAirplanes, grats);

  }

  function uploadToDataBase(name, currentAirplanes, grats) {
    //uploadedDataPoints.map((data) => typeof data == undefined ? data = "undefined" : console.log('all good to go!'));
    var data = {
      "accName": name || null,
      "planes": currentAirplanes || null,
      "gratitudes": grats || null
    }
    ref.push(data);
  }

  function sendMessage() {
    if (paperOut) { // hide the letter, record values
      currentGrat = writeBox.value();
      console.log(currentGrat); // temp record value
      if (currentGrat.length>2) {
        logDateAndGrat(currentGrat); // add the current grat to the giant list of grats
        getResponseTan(currentGrat);
      }
      paperOut = false; // the paper disappears
      //letterImage.hide(); // hide the paper
      //inOut = true;
      fadeEverythingLetter('out');
      setTimeout(() => letter.map((element) => element.hide()), 500);
      //fadeInOut('out', journalImage);
      //writeBox.hide();
      writeBox.value(''); // reset the value in writeBox

      writeButton.html('write');

      journalButton.show();


    } else { // show the letter
      paperOut = true;
      //letterImage.show(); // show the letter
      inOut = false;
      fadeEverythingLetter('in');
      letter.map((element) => element.show())
      //fadeInOut('in', journalImage);
      //writeBox.show();

      writeButton.html('send'); // switch button to show 'send'

      journalButton.hide();

    }

  }

  function logDateAndGrat(grat) {
    var currentDateIndex;

    if (currentDate.toString() == makeDate().toString()) { // test if the last previous recorded date is the current one
      currentDateIndex = grats.findIndex((thing) => thing[0].toString() == currentDate.toString());
      console.log(currentDateIndex);
      console.log(currentDate);
      grats[currentDateIndex].push(grat); // if it is, add the current grat to the nest array corresponding with the date

      console.log('its the same day');
      //onsole.log(currentDate);
    } else { // if not, record the new date
      currentDate = makeDate();
      grats.push([currentDate]); // create a new nested array within the bigger array
      grats[currentDateIndex].push(grat); // push the new grat to the last created array in grats
      console.log(grats);
      console.log('its not the same day');
      console.log(currentDate == month()+day()+year());

    }
    uploadToDataBase(name, currentAirplanes, grats);

  }

  function drawJournal() {
    currentSeenPage = 0;

    var allWrittenEntries = "";
    if (journalOut) { // similar functionality to sendMessage + logDateAndGrat
      fadeEverythingJournal('out');
      setTimeout(() => journal.map((element) => element.hide()), 500);

      journalButton.html('journal');
      journalOut = false;
      //fadeInOut('out', letterImage);


      writeButton.show();

    } else {
      fadeEverythingJournal('in');
      journal.map((element) => element.show());
      //fadeInOut('in',journalImage);
      journalButton.html('close');
      journalOut = true;

      allWrittenEntries = writeAllWrittenEntries();
      console.log(allWrittenEntries.length);
      leftPage.html(allWrittenEntries[currentSeenPage]); // use writeAllWrittenEntries to create a string that can be drawn on the journal
      (typeof allWrittenEntries[currentSeenPage+1] == "undefined" ? rightPage.html("") : rightPage.html(allWrittenEntries[currentSeenPage+1]));



      showHideArrows(allWrittenEntries.length);
      rightArrow.mousePressed(drawNextPages);
      leftArrow.mousePressed(drawPrevPages);

      writeButton.hide();
    }

  }

  function writeAllWrittenEntries() { // prob most inefficient function so far
    var writtenEntry = ""; // create empty writtenEntry and allWrittenEntries variables
    //var allWrittenEntries = "";
    var allWrittenEntriesArray = [""];

    var lines = 0;
    var maxLines = 16;
    var currentPage = 0;

    for (entry=0; entry<grats.length; entry++) { // go through every single entry in grats - first nested array (may get laggy)
      lines++;
      for (i=0; i<grats[entry].length;i++) { // go through each element in each entry
        lines++;

        if (i==0) { // first element is always the date (add ways to foolproof this in case of bugs)
          writtenEntry = getMonth(grats[entry][i][0]) + " " + grats[entry][i][1] + ", " + grats[entry][i][2]; // create a string representing the date in string form from the array
          console.log(i);
        } else {
          writtenEntry = grats[entry][i]; // after the first item, simply add all the gratitudes following the date, separating each with a line break
        }
        if (lines == 0 || lines > maxLines) { // if the text exceeds the amount of lines that are meant to go on a page, create a new page
          lines = 0;
          currentPage++;
          allWrittenEntriesArray.push(writtenEntry + "<br>"); // push the current thing to the next page
          //allWrittenEntriesArray.push(allWrittenEntries);
          console.log(allWrittenEntriesArray);
          console.log(lines);
          console.log(currentPage);

        } else {
          allWrittenEntriesArray[currentPage] = allWrittenEntriesArray[currentPage]+ writtenEntry + "<br>"; // if the page still has room, continue to write onto that page
          console.log(allWrittenEntriesArray);
        }


      }

      allWrittenEntriesArray[currentPage] = allWrittenEntriesArray[currentPage]+ "<br>" // between each entry, add two line breaks



    }
    console.log(lines);
    return allWrittenEntriesArray;

  }

  function fadeInOut(inOut, thing) {
    var opacity = +thing.style('opacity');
    var fadeTiming = setInterval(timeFadeIn, 23);
    //console.log('is this thing on');

    function timeFadeIn() {
      opacity = (inOut == 'in' ? opacity + 0.05 : opacity - 0.05);
      thing.style('opacity', opacity);
      //console.log(opacity);
      if (inOut == 'in' ? opacity>=1 : opacity <= 0) {
        clearInterval(fadeTiming);
        return;
      }
    }
  }

  function fadeEverythingLetter(inOut) {
    letter.forEach(thing => fadeInOut(inOut, thing));
  }

  function fadeEverythingJournal(inOut) {
    journal.forEach(thing => fadeInOut(inOut, thing));
    console.log(journal[0].style('opacity'));
  }

  function fadeEverythingReturn(inOut) {
    returnEl.forEach(thing => fadeInOut(inOut, thing));
    //console.log(returnEl[0].style('opacity'));
  }

  function fadeEverythingStart(inOut) {
    start.forEach(thing => fadeInOut(inOut, thing));
  }

  function drawNextPages() {


    allWrittenEntries = writeAllWrittenEntries();
    //leftPage.html("");
    currentSeenPage+=2;
    console.log("drawing page: " + currentSeenPage);
    showHideArrows(allWrittenEntries.length);
    leftPage.html(allWrittenEntries[currentSeenPage]); // use writeAllWrittenEntries to create a string that can be drawn on the journal
    (typeof allWrittenEntries[currentSeenPage+1] == "undefined" ? rightPage.html("") : rightPage.html(allWrittenEntries[currentSeenPage+1]));
  }

  function drawPrevPages() {

    //console.log("drawing page: " + currentPage);
    allWrittenEntries = writeAllWrittenEntries(currentSeenPage);
    //leftPage.html("");
    currentSeenPage-=2;
    console.log("drawing page: " + currentSeenPage);
    showHideArrows(allWrittenEntries.length);
    leftPage.html(allWrittenEntries[currentSeenPage]); // use writeAllWrittenEntries to create a string that can be drawn on the journal
    (typeof allWrittenEntries[currentSeenPage+1] == "undefined" ? rightPage.html("") : rightPage.html(allWrittenEntries[currentSeenPage+1]));
  }

  function showHideArrows(arrayLength) {
    console.log("showhide" + arrayLength);
    if (!(currentSeenPage <= 0 || currentSeenPage >= arrayLength - 1)) {
      leftArrow.show();
      rightArrow.show();
    }
    if (currentSeenPage <= 0) {
      leftArrow.hide();
      console.log('i am working');
    }
    if (currentSeenPage >= arrayLength - 1) {
      rightArrow.hide();
      console.log('iam working as well');
    }
  }

  function makeDate() {
    return [month(), day(), year()]; // simply create a usable array of the current date
  }

  function getMonth(num) { // a lot of switch cases to determine the month from the number passed into the function!
    switch (num) {
      case 1:
        return "January";
      case 2:
        return "February";
      case 3:
        return "March";
      case 4:
        return "April";
      case 5:
        return "May";
      case 6:
        return "June";
      case 7:
        return "July";
      case 8:
        return "August";
      case 9:
        return "September";
      case 10:
        return "October";
      case 11:
        return "November";
      case 12:
        return "December";
    }
  }

  function getResponseTan(grat) {
    var message;
    var haveGift;
    var giftPool = [1,2];
    var gift;

    var option = Math.floor(random(1, 4));
    console.log("option of letter: " + option);
    switch (option) {
      case 1:
        responseLetter();
        if (message == null) {
          (Math.floor(random(0, 2)) == 1 ? expLetter() : adviceLetter());
        }
        break;
      case 2:
        expLetter();
        break;
      case 3:
        adviceLetter();
        break;
    }

    function responseLetter() {
      console.log("resp letter");
      var people = /friend|family|mom|dad|mother|father|bro(ther|)|sis(ter|)|neighbor|teacher|classmate|mailman|coworker|boss|(wo|)man|pe(rson|ople)|child|human|wife|husband|girl|boy|bf|gf|community|stranger/i;
      var place = /(palo alto)|bay|area|park|cali|home|house|school|market|store|bank|office|north|west|east|south|church|street|town|hospital|uni(versity|)|beach|sea|lake|m(oun|)t(ain|)|hotel|village|site|place|bed|desk|room|library|kitchen|theater|neighborhood|gunn|jls|paly/i;
      var things = /thing|freedom|work|idea|hope|possibility|dream|creativ(e|ity)|tech|phone|computer|food|money|book|comment|compliment|music|game|safety|wi(-|)fi|clothes|raise|tv|show|movie|magazine|peace|quiet|nature|health|forgive(ness)|gift|realiz(e|ation)|insight|sleep|spirit|earth|religion|universe|comfort|minecraft|(among us)|valorant|grade|draw|exercise|run|(work out)|productivity|night|day|sunrise|sunset/i;
      var categories = [people, place, things];
      var matches = categories.map((type) => grat.match(type)).map(arr => (arr == null ? [] : arr)).map(arr => arr.length);
      var theMatch = matches.reduce((a,b,index, arr) => (arr[index] > a ? index : a), 0);
      console.log(matches);
      console.log("match index: " + theMatch);


      switch (theMatch) {
        case 0:
          message = "I'm writing to respond to your letter! Who is this person you talk about? I hope they make you happy.";
          giftPool.push(3, 4);
          break;

        case 1:
          message = "Your letter warmed my heart. The place you write about must be wonderful. Our environment is everything, no?";
          giftPool.push(4, 5);
          break;
        case 2:
          message = "I recall something from a letter you sent me. I wish what you wrote about still makes you smile on the inside.";
          giftPool.push(5, 6);
          break;

      }

      if (matches.reduce((a, b) => a + b) <= 0) {
        message = null;
        giftPool = [1, 2];
      }

    }

    function expLetter() {
      console.log("exp letter");
      var expLetters = ["Today, I walked by the lake and thought about the past. I hope you're doing well.", "I baked some cookies with my grandchildren. It was all good in the end, except we forgot to add the baking powder...", "Today I did...nothing! It's been a while since I've done that. Have a picture I drew while doing nothing!"];
      var messageIndex = Math.floor(random(0, expLetters.length));
      message = expLetters[messageIndex];

      switch (messageIndex) {
        case 0:
          giftPool = [7];
          break;

        case 1:
          giftPool = [8];
          break;

        case 2:
          giftPool = [9];
          break;
      }

    }
    function adviceLetter() {
      console.log("adv letter");
      var adviceLetters = ["Hey, just checking in to see how you're doing. Life can be overwhelming sometimes. Whatever you're up to, I'm here for you!", "I hope you went outside and got some sunshine today. However short or long of a duration, it doesn't matter. If you didn't, that's good too. You're great!", "Feeling unworthy is an odd thing. All the time, you feel as if you just aren't enough. No matter. I wrote to tell you that you that you shouldn't be like me. You are enough, and nothing can tell you otherwise.", "We've come a long way, haven't we? I think it's hard to remember we've done so many difficult things in our lives. I'm proud of you."];
      var adviceIndex = Math.floor(random(0, adviceLetters.length));
      message = adviceLetters[adviceIndex];
      giftPool.push(3, 4, 5, 6);

    }

    function chooseGift() {
      if (Math.floor(random(0, 2)) == 0) {
        haveGift = true;
        gift = random(giftPool);
      } else {
        haveGift = false;
      }
    }

    console.log(message);
    console.log("gift pool:" + giftPool);
    chooseGift();
    var airplane1 = new returnLetter(message, haveGift, gift);

    currentAirplanes.push(airplane1);
    //uploadToDataBase(name, currentAirplanes, grats);
    console.log('if this never appears, this is where the prob is');
    if (currentAirplanes[0] == airplane1) {
      planeStatus();

    }


  }

  function planeStatus() {
    if (currentAirplanes.length > 0) {
      planeTime = setTimeout(() => currentAirplanes[0].appear(), 2000);
      currentAirplanes[0].canClick();
    }
  }

  function showReturnLetter() {
    var timesClicked = 0;
    //console.log(returnPaperOut);
    if (!returnPaperOut) { // fade in the paper w tan's letter on it
      //clearInterval(planeTime);

      console.log('paper is fading in');
      timesClicked++;

      console.log(currentAirplanes[0]);
      currentAirplanes[0].writeTanLetter();

      fadeEverythingReturn('in');
      returnEl.map((element) => element.show());
      writeButton.hide();
      journalButton.hide();

      returnPaperOut = true;

    } else {

      console.log('paper is fading out');
      timesClicked++;

      fadeEverythingReturn('out');
      setTimeout(() => returnEl.map((element) => element.hide()), 500);
      writeButton.show();
      journalButton.show();

      console.log(currentAirplanes[0]);
      currentAirplanes[0].disappear();
      //currentAirplanes[0].yeet();

      console.log('plane disappeared, what is current interval?: ' + planeTime);

      currentAirplanes.shift(); // the current letter has been read, take it off the currentAirplanes list
      planeStatus(); // check if we should continue sending letters
      console.log('new interval was set, what is it?: ' + planeTime);
      returnPaperOut = false;
    }
    console.log(timesClicked);

  }

  class returnLetter {
    constructor(message, haveGift, gift) {
      this.message = message;
      this.haveGift = haveGift;
      this.gift = gift;
      this.image = returnPlane;
      this.pauseImage = returnPausePlane;

      //this.paY = this.pauseImage.style('top');
      //this.stY = this.image.style('top');
      //fill(255, 255, 255);
      //this.hitBox = rect(this.x, this.y, 20, 20);

    }
    appear() {
      //clearInterval(planeTime);

      console.log("plane appeared, interval shouldc lear: " + planeTime);
      this.image.style('opacity', 1);
      this.image.show();

      var timePlane = setTimeout(() => {
        this.pauseImage.style('opacity', 1);
        this.pauseImage.show();
        this.image.style('opacity', 0);
        this.image.hide();
        console.log("after 2.6 sec");
      }, 2300);

      //currentAirplanes.shift();

    }

    disappear() {
      this.pauseImage.hide();
      this.pauseImage.style('opacity', 0);
    }

    writeTanLetter() {
      var finishedLetter = "<br> Dear " + name + ", <br> <br> " + this.message + "<br> <br> <br> Sincerely, Tan";
      returnText.html(finishedLetter);
    }

    canClick() {
      this.pauseImage.mousePressed(showReturnLetter);
    }

  }

}
function draw() {

}
