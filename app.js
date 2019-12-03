// var constraints = { video: { facingMode: "user" }, audio: false };

// const cameraView = document.querySelector("#camera--view"),
// cameraTrigger = document.querySelector("#camera--trigger"),

function cameraStart() {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
        track = stream.getTracks()[0];
        cameraView.srcObject = stream;
    })
    .catch(function(error) {
        // console.error("Oops. Something is broken.", error);
        console.error("Oops. Something is broken.", error);
    });
}

const fileInput = document.getElementById('file-input');

const output = document.getElementById('output');

const player = document.getElementById('player');

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('capture');


const constraints = {
    video: true,
    };

// fileInput.addEventListener('change', (e) => doSomethingWithFiles(e.target.files));

function doSomethingWithFiles(fileList) {
    console.log("test");
    let file = null;

    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].type.match(/^image\//)) {
        file = fileList[i];
        break;
      }
    }

    if (file !== null) {
        output.src = URL.createObjectURL(file);
    }
}

navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    player.srcObject = stream;
});

captureButton.addEventListener('click', () => {
    // Draw the video frame to the canvas.
    context.drawImage(player, 0, 0, canvas.width, canvas.height);
    // var data = canvas.toDataURL("image/png");
    var data = canvas.toDataURL("image/jpeg");

    printOriginal(data);

    // console.log("1: ");
    // console.log(data);

    // var blob = dataURItoBlob(data);

    // Add a newline after the comma
    // formattedString = data.replace(',', ',\n');
    // console.log("2: ");
    // console.log(formattedString);

    // get everything after "base64,"

    // var exifObj = piexif.load(data);
    // console.log(exifObj);

    // Needs to be file data . or blob
  });

  // Attach the video stream to the video element and autoplay.
  navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
      player.srcObject = stream;
    });

function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);
    
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    
    // create a view into the buffer
    var ia = new Uint8Array(ab);
    
    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    
    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], {type: mimeString});
    return blob;
    
    }

function printOriginal(dataURL) {
    console.log("Begin PrintOrigianal");
    var exifObj = piexif.load(dataURL);
    
    $("#existingDiv").html("");

    for (var ifd in exifObj) {
        if (ifd == "thumbnail") {
            continue;
        }
        $("#existingDiv").append("<b><p>" + "-" + ifd + "</p></b>");
        // console.log("-" + ifd);
        for (var tag in exifObj[ifd]) {
            // console.log("  " + piexif.TAGS[ifd][tag]["name"] + ":" + exifObj[ifd][tag]);
            $("#existingDiv").append("<p style=\"margin-left: 15px;\">" + "<b>" + piexif.TAGS[ifd][tag]["name"] + "</b>" + ":" + exifObj[ifd][tag] + "</p>");
            // document.getElementsByTagName("p")[0].innerHTML = document.getElementsByTagName("p")[0].innerHTML + "\n" + piexif.TAGS[ifd][tag]["name"] + ":" + exifObj[ifd][tag];
        }
        $("#existingDiv").append("<hr>");
    }

}

function printFileSelect(evt) {
    console.log("Begin: PrintFileSelect(): ");
    // File array
    // console.log(evt);
    // File
    var f = evt.target.files[0]; // FileList object
    // console.log(f);
    var reader = new FileReader();

    reader.onloadend = function(e) {
        // console.log(e);
        console.log("Start reader onload");
        console.log("-----------------------------------------");

        console.log(e.target.result);
        var exifObj = piexif.load(e.target.result);

        $("#existingDiv").html("");

        for (var ifd in exifObj) {
            if (ifd == "thumbnail") {
                continue;
            }
            $("#existingDiv").append("<b><p>" + "-" + ifd + "</p></b>");
            // console.log("-" + ifd);
            for (var tag in exifObj[ifd]) {
                // console.log("  " + piexif.TAGS[ifd][tag]["name"] + ":" + exifObj[ifd][tag]);
                $("#existingDiv").append("<p style=\"margin-left: 15px;\">" + "<b>" + piexif.TAGS[ifd][tag]["name"] + "</b>" + ":" + exifObj[ifd][tag] + "</p>");
                // document.getElementsByTagName("p")[0].innerHTML = document.getElementsByTagName("p")[0].innerHTML + "\n" + piexif.TAGS[ifd][tag]["name"] + ":" + exifObj[ifd][tag];
            }
            $("#existingDiv").append("<hr>");
        }

        // The Data URL
        // console.log(e.target.result);

        // for (var ifd in exifObj) {
        //     if (ifd == "thumbnail") {
        //         continue;
        //     }
        //     console.log("-" + ifd);
        //     for (var tag in exifObj[ifd]) {
        //         console.log("  " + piexif.TAGS[ifd][tag]["name"] + ":" + exifObj[ifd][tag]);
        //     }
        // }
    };
    reader.readAsDataURL(f);
}

// // Initiate the cameraStart function when the window is finished loading.
window.addEventListener("load", cameraStart, false);