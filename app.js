/* Start of main code */
var exifObj;

var file;

// Draws the metadata into a new image.
// function handleFileSelect(evt) {
//     var f = evt.target.files[0]; // FileList object
//     var reader = new FileReader();
//     reader.onloadend = function(e) {
//         var image = new Image();
//         image.src = e.target.result;
//         image.onload = function() {
//             var canvas = document.getElementById("canvas");
//             var ctx = canvas.getContext("2d");
//             ctx.drawImage(image, 0, 0, 200, 100);                
//         };
//     };
//     reader.readAsDataURL(f);
// }

function printOriginalFileSelect(evt) {
    // Parameter = File array

    // File
    file = evt.target.files[0]; // FileList object
    
    var reader = new FileReader();
    reader.onloadend = function(e) {
        // console.log(e);
        console.log("Begin Reading File");
        console.log("-----------------------------------------");

        exifObj = piexif.load(e.target.result);

        $("#originalMetadata").html("<h2>Original Metadata</h2>");

        for (var ifd in exifObj) {
            if (ifd == "thumbnail") {
                continue;
            }
            $("#originalMetadata").append("<b><p>" + "-" + ifd + "</p></b>");
            // console.log("-" + ifd);
            for (var tag in exifObj[ifd]) {
                $("#originalMetadata").append("<p style=\"margin-left: 15px;\">" + "<b>" + piexif.TAGS[ifd][tag]["name"] + "</b>" + ":" + exifObj[ifd][tag] + "</p>");
                $("#originalMetadata").append("<hr>");
            }
        }

        // printDataURL(e.target.result);
    };
    reader.readAsDataURL(file);
}

function printResizedFileSelect(dataURL, header) {
    // Parameter = File array
    
        // console.log(e);
        console.log("Begin Reading File");
        console.log("-----------------------------------------");

        var exifObj = piexif.load(dataURL);

        $("#resizedMetadata").html("<h2>" + header + "</h2>");

        for (var ifd in exifObj) {
            if (ifd == "thumbnail") {
                continue;
            }
            $("#resizedMetadata").append("<b><p>" + "-" + ifd + "</p></b>");
            // console.log("-" + ifd);
            for (var tag in exifObj[ifd]) {
                $("#resizedMetadata").append("<p style=\"margin-left: 15px;\">" + "<b>" + piexif.TAGS[ifd][tag]["name"] + "</b>" + ":" + exifObj[ifd][tag] + "</p>");
                $("#resizedMetadata").append("<hr>");
            }
        }

        // printDataURL(e.target.result);
}

function printResizedCopyFileSelect(dataURL, header) {
    // Parameter = File array
    
        // console.log(e);
        console.log("Begin Reading File");
        console.log("-----------------------------------------");

        var exifObj = piexif.load(dataURL);

        $("#resizedMetadataCopied").html("<h2>" + header + "</h2>");

        for (var ifd in exifObj) {
            if (ifd == "thumbnail") {
                continue;
            }
            $("#resizedMetadataCopied").append("<b><p>" + "-" + ifd + "</p></b>");
            // console.log("-" + ifd);
            for (var tag in exifObj[ifd]) {
                $("#resizedMetadataCopied").append("<p style=\"margin-left: 15px;\">" + "<b>" + piexif.TAGS[ifd][tag]["name"] + "</b>" + ":" + exifObj[ifd][tag] + "</p>");
                $("#resizedMetadataCopied").append("<hr>");
            }
        }

        // printDataURL(e.target.result);
}

// function printResizedFileSelect(dataURL) {
//     // Parameter = File array
    
//     var reader = new FileReader();
//     reader.onloadend = function(e) {
//         // console.log(e);
//         console.log("Begin Reading File");
//         console.log("-----------------------------------------");

//         var exifObj = piexif.load(e.target.result);

//         $("#resizedMetadata").html("<h2>Resized Metadata</h2>");

//         for (var ifd in exifObj) {
//             if (ifd == "thumbnail") {
//                 continue;
//             }
//             $("#resizedMetadata").append("<b><p>" + "-" + ifd + "</p></b>");
//             // console.log("-" + ifd);
//             for (var tag in exifObj[ifd]) {
//                 $("#resizedMetadata").append("<p style=\"margin-left: 15px;\">" + "<b>" + piexif.TAGS[ifd][tag]["name"] + "</b>" + ":" + exifObj[ifd][tag] + "</p>");
//                 $("#resizedMetadata").append("<hr>");
//             }
//         }

//         // printDataURL(e.target.result);
//     };
//     reader.readAsDataURL(file);
// }

// Working
function displayImage(evt) {
    document.getElementById("resize").disabled = false;

    var originalImg = document.querySelector("#original");
    var f = evt.target.files[0]; // FileList object
    var reader = new FileReader();
    reader.onloadend = function(e) {
        console.log("Start reader onload");
        console.log("-----------------------------------------");

        $("#original-xy").html("");

        // Create a 'fake' image to get the raw dimensions
        var img = new Image();
        img.onload = function(){
            $("#original-xy").append("Original: " + this.width + " x " + this.height);
        };
        img.src = e.target.result

        // console.log(e.target.result);
        

        originalImg.src = e.target.result
        // $("#original-xy").append("Original: " + originalImg.width + " x " + originalImg.height);
        //printDataURL(e.target.result);
    }
    reader.readAsDataURL(f);
}

// function displayImage(evt) {
//     document.getElementById("resize").disabled = false;

//     var img = new Image();

//     var f = evt.target.files[0]; // FileList object
//     var reader = new FileReader();
//     reader.onloadend = function(e) {
//         console.log("Start reader onload");
//         console.log("-----------------------------------------");

//         // console.log(e.target.result);
//         // $("#original-xy").value = "";

//         img.onload = function(){
//             alert( this.width+' '+ this.height );
//         };

//         img.src = e.target.result
//         // $("#original-xy").append("Original: " + originalImg.width + " x " + originalImg.height);
//         //printDataURL(e.target.result);
//     }
//     reader.readAsDataURL(f);
// }

function clearImage(evt) {
    console.log("Image cleared");
    document.getElementById("resize").disabled = true; 
    var resizedImg = document.querySelector("#resized");
    resizedImg.src = "0://";
}

function defaultValues(evt) {
    console.log("Values set to default");
    document.getElementById("height").value = 200;
    document.getElementById("width").value = 200;
    document.getElementById("horw").value = "h";
}

function resizeFileSelect(evt) {
    // Get values
    var originalImg = document.querySelector("#original");
    var resizedImg = document.querySelector("#resized");

    var height = document.getElementById("height").value;
    var width = document.getElementById("width").value;
    var horw = document.getElementById("horw").value;

    // Reset the resized field
    console.log("Clearing Resize Field");

    console.log("height: ");
    console.log(height);

    console.log("width: ");
    console.log(width);

    console.log("horw: ");
    console.log(horw);
    
    resizedImg.src = "0://";
    resizedImg.src = resize(originalImg, height, width, horw);

    printResizedFileSelect(resizedImg.src, "Resized Metadata");

    /* Copy the Original Image's metadata into the Resized Image */
    var exifBytes = piexif.dump(exifObj);
    var exifModified = piexif.insert(exifBytes, resizedImg.src);

    console.log("exifModified; ");
    console.log(exifModified);
    
    printResizedCopyFileSelect(exifModified, "Metadata Copied Into");



    // printDataURL(e.target.result);
    // var exifObj = piexif.load(e.target.result);
}

function resize(image, wantedHeight, wantedWidth, heightOrWidth) {
    // Get the current image dimensions
    var originalHeight = image.height;
    var originalWidth = image.width;

    // Calculate the ratio
    // aspectRatio = width / height
    var aspectRatio = image.width / image.height;

    console.log("Original Height = " + originalHeight);
    console.log("Original Width = " + originalWidth);

    console.log("Aspect Ratio = " + aspectRatio);

    // Keep the same aspect ratio when resizing.
    // newWidth = aspectRatio * height

    // Fix the height or the width
    if (heightOrWidth == "h") {
        console.log("----------------------------");
        console.log("Height Fixed");

        var aspectWidth = wantedHeight * aspectRatio;
        // console.log("Height = " + wantedHeight);
        // console.log("Aspect Width = " + aspectWidth);
        // console.log("Ratio = " + wantedHeight / aspectWidth);

        // wantedHeight = wantedHeight;
        wantedWidth = aspectWidth;
    }
    else if (heightOrWidth == "w") {
        console.log("----------------------------");
        console.log("Width Fixed");

        var aspectHeight = wantedWidth / aspectRatio;
        // // console.log("Aspect Height = " + aspectHeight);
        // // console.log("Width = " + wantedWidth);
        // // console.log("Ratio = " + wantedWidth / aspectHeight);

        // wantedHeight = aspectHeight;
        wantedWidth = wantedWidth;
    }
    else {
        console.log("Error: Invalid 4th parameter");
    }

    console.log("Height = " + wantedHeight);
    console.log("Width = " + wantedWidth);
    console.log("Ratio = " + wantedWidth / wantedHeight);

    console.log("----------------------------");

    // Create a new canvas
    var canvas = document.createElement('canvas');
    // ctx is still part of the canvas
    var ctx = canvas.getContext('2d');
    // Set the canvas to the wanted dimensions
    canvas.height = wantedHeight;
    canvas.width = wantedWidth;

    // Draw the image to the same dimensions wanted (also same as the canvas)
    // drawImage(img,x,y,width,height);
    ctx.drawImage(image, 0, 0, wantedWidth, wantedHeight);

    
    $("#resized-xy").html("");

    // Create a 'fake' image to get the raw dimensions
    $("#resized-xy").append("Resized: " + canvas.width + " x " + canvas.height);

    // Get and return the DataUrl
    var dataURL = canvas.toDataURL('image/jpeg');
    console.log("dataURL: ");
    console.log(dataURL);
    return dataURL;
}