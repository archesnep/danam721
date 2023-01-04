/**
 * letteranimation.js
 * https://www.cssanimatio.io
 * Created and maintained by: Pavel
 * Find me at: https://www.linkedin.com/in/yesiamrocks/
 * Email: hello@cssanimation.io
 * Github: https://github.com/yesiamrocks/cssanimation.io
 * Title: CSS Animation Library for Developers and Ninjas
 * Copyright (c) 2017 Pavel
 * License: cssanimattion is licensed under the MIT license
 **/

window.onload = function() {
    animateSequence();
    animateRandom();
};

function animateSequence() {
    var a = document.getElementsByClassName('sequence');
    for (var i = 0; i < a.length; i++) {
        var $this = a[i];
        var letter = $this.innerHTML;
        letter = letter.trim();
        var str = '';
        var delay = 100;
        for (l = 0; l < letter.length; l++) {
            if (letter[l] != ' ') {
                str += '<span style="animation-delay:' + delay + 'ms; -moz-animation-delay:' + delay + 'ms; -webkit-animation-delay:' + delay + 'ms; ">' + letter[l] + '</span>';
                delay += 150;
            } else
                str += letter[l];
        }
        $this.innerHTML = str;
    }
}

function animateRandom() {
    var a = document.getElementsByClassName('random');
    for (var i = 0; i < a.length; i++) {
        var $this = a[i];
        var letter = $this.innerHTML;
        letter = letter.trim();
        var delay = 70;
        var delayArray = new Array;
        var randLetter = new Array;
        for (j = 0; j < letter.length; j++) {
            while (1) {
                var random = getRandomInt(0, (letter.length - 1));
                if (delayArray.indexOf(random) == -1)
                    break;
            }
            delayArray[j] = random;
        }
        for (l = 0; l < delayArray.length; l++) {
            var str = '';
            var index = delayArray[l];
            if (letter[index] != ' ') {
                str = '<span style="animation-delay:' + delay + 'ms; -moz-animation-delay:' + delay + 'ms; -webkit-animation-delay:' + delay + 'ms; ">' + letter[index] + '</span>';
                randLetter[index] = str;
            } else
                randLetter[index] = letter[index];
            delay += 80;
        }
        randLetter = randLetter.join("");
        $this.innerHTML = randLetter;
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// design 7
// var data = [
//     {
//       AboutDevTypeText: "<span>Monument of the month </span>"
//     }
//   ];
  
//   var allElements = document.getElementsByClassName("typeing");
//   for (var j = 0; j < allElements.length; j++) {
//     var currentElementId = allElements[j].id;
//     var currentElementIdContent = data[0][currentElementId];
//     var element = document.getElementById(currentElementId);
//     var devTypeText = currentElementIdContent;
  
//     // type code
//     var i = 0, isTag, text;
//     (function type() {
//       text = devTypeText.slice(0, ++i);
//       if (text === devTypeText) return;
//       element.innerHTML = text + `<span class='blinker'>&#32;</span>`;
//       var char = text.slice(-1);
//       if (char === "<") isTag = true;
//       if (char === ">") isTag = false;
//       if (isTag) return type();
//       setTimeout(type, 60);
//     })();
//   }
  
