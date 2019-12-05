/* Start of main code */
var exifObj;

var file;

// The dimensions of the resized image - set in resize()
var resizedW;
var resizedH;

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

    // Make sure resize button is disabled
    document.getElementById("resize").disabled = true;
    
    var reader = new FileReader();
    reader.onloadend = function(e) {
        // console.log(e);

        try {
            exifObj = piexif.load(e.target.result);

            /* Get Latitude and Longtitude from the  Exif metadata */

            console.log(exifObj);

            // Latitude

            console.log("---")
            // latDirection: N
            var latDir = exifObj.GPS[1];
            console.log(latDir);
            // latString: 37,1,53,1,1520,100
            var lat = exifObj.GPS[2][0][0] + "," + exifObj.GPS[2][0][1] + "," + exifObj.GPS[2][1][0] + "," + exifObj.GPS[2][1][1] + "," + exifObj.GPS[2][2][0] + "," + exifObj.GPS[2][2][1];
            console.log(lat);

            console.log("---");

            // Longtitude

            var longDir = exifObj.GPS[3];
            console.log(longDir);
            var long = exifObj.GPS[4][0][0] + "," + exifObj.GPS[4][0][1] + "," + exifObj.GPS[4][1][0] + "," + exifObj.GPS[4][1][1] + "," + exifObj.GPS[4][2][0] + "," + exifObj.GPS[4][2][1];
            console.log(long);

            console.log("---");

            /* Convert coordinates to Decimal Degree Format */
            var ddLat = ConvertDMSToDD(lat, latDir);
            var ddLong = ConvertDMSToDD(long, longDir);

            // Output Results
            $("#lat").html("");
            $("#lat").append(ddLat);
            $("#long").html("");
            $("#long").append(ddLong);

            ddLatLong = ddLat + ", " + ddLong;

            $("#lat-long").html("");
            $("#lat-long").append(ddLatLong);

            // exifObjEditted = overrideDimensions(exifObj);

            // DateTime
            var dateTime = exifObj["0th"]["306"];

            console.log(dateTime);

            $("#date-time").html("");
            $("#date-time").append(dateTime);

            /* end edit */

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

            // Image uploaded and has metadata so enable resize
            document.getElementById("resize").disabled = false;
        }
        catch(err) {
            console.log("Error: Invalid / No Metadata Detected in Image");
            $("#error").html("");
            $("#error").append("Error: Invalid / No Metadata Detected in Image");
        }
    };
    reader.readAsDataURL(file);
}

function ConvertDMSToDD(gpsString, direction) {
    // ->Input csv string

    console.log("Converting coordinates...");
    // console.log(gpsString);

    // Separate into array
    var inputArray = gpsString.split(',');
    // console.log(inputArray);

    var dd; 

    // Validate it has the proper length
    if (inputArray.length == 6) {
        var degrees = inputArray[0] / inputArray[1];
        var minutes = inputArray[2] / inputArray[3];
        var seconds = inputArray[4] / inputArray[5];
        
        dd = degrees + minutes/60 + seconds/(60*60);

        // console.log("Direction: " + direction);
        if (direction == "S" || direction == "W") {
            dd = dd * -1;
        } // Don't do anything for N or E
    }
    else {
        // Error
        console.log("Error GPS String is an invalid format")
        dd = "error";
    }
    return dd;
}

function overrideDimensions(inExifData, pixelX, pixelY) {
    // pixelX and pixelY must be a number)
    console.log("-------------------------------------");
    for (var ifd in inExifData) {
        if (ifd == "thumbnail") {
            continue;
        }
        // console.log("-" + ifd);

        // Loop through the metadata
        for (var tag in inExifData[ifd]) {
            // Find PixelX
            if (piexif.TAGS[ifd][tag]["name"] == "PixelXDimension") {
                inExifData[ifd][tag] = pixelX;
                // console.log(pixelX);

                console.log("Pixel X has been overriden in resized image: " + pixelX);
            }
            // Find Pixel Y
            if (piexif.TAGS[ifd][tag]["name"] == "PixelYDimension"){
                inExifData[ifd][tag] = pixelY;
                // console.log(pixelY);

                console.log("Pixel Y has been overriden in resized image: " + pixelY);
            }
        }
    }
    console.log("-------------------------------------");

    // console.log("After");
    // console.log(inExifData);
    
    return inExifData;

}

function printResizedCopyFileSelect(dataURL, header) {
    // Parameter = File array
    
    // console.log(e);

    // Load the metadata URL into an object
    var exifObj = piexif.load(dataURL);

    // Get resizedDimensions


    // Override the Pixel Dimensions
    exifObjEditted = overrideDimensions(exifObj, resizedW, resizedH);

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

    var originalImg = document.querySelector("#original");
    var f = evt.target.files[0]; // FileList object
    var reader = new FileReader();
    reader.onloadend = function(e) {
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

function convertDataURLtoImage(dataURL) {
    var img = new Image;
    img.src = dataURL;
    return img;
}

function clearImage(evt) {
    console.log("Image cleared");
    document.getElementById("resize").disabled = true; 

    // Clear the file picker
    $("#files").val("");

    // Clear the error message
    $("#error").html("");

    var originalImg = document.querySelector("#original");
    originalImg.src = "0://";

    var resizedImg = document.querySelector("#resized");
    resizedImg.src = "0://";

    // Clear the dimension Divs
    $("#original-xy").html("");
    $("#resized-xy").clear("");

    // Clear the Metadata Divs
    $("#originalMetadata").html("");
    $("#resizedMetadataCopied").html("");

    // Clear Output Parameter Divs
    $("#date-time").html("");
    $("#lat").html("");
    $("#long").html("");
    $("#lat-long").html("");
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


    /* Copy the Original Image's metadata into the Resized Image */
    var exifBytes = piexif.dump(exifObj);
    var exifModified = piexif.insert(exifBytes, resizedImg.src);
    
    printResizedCopyFileSelect(exifModified, "Resized Metadata");

    // Show link and update it
    // $("#downloadLink").show();

    // var img = new Image;
    // img.src = exifModified;
    // $("#downloadLink").setAttribute("download", "test");
    // $("#downloadLink").href = exifModified;

    // printDataURL(e.target.result);
    // var exifObj = piexif.load(e.target.result);
}

function resize(image, wantedHeight, wantedWidth, heightOrWidth) {
    // Get the current image dimensions
    var originalHeight = image.height;
    var originalWidth = image.width;

    // Calculate the Aspect Ratio = Width / Height
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

        wantedWidth = aspectWidth;
    }
    else if (heightOrWidth == "w") {
        console.log("----------------------------");
        console.log("Width Fixed");

        var aspectHeight = wantedWidth / aspectRatio;

        wantedHeight = aspectHeight;
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

    // Clear the dimensions div incase of consecutive uploads
    $("#resized-xy").html("");
    $("#resized-xy").append("Resized: " + canvas.width + " x " + canvas.height);

    // Save the resized image height in global variables
    resizedW = canvas.width;
    resizedH = canvas.height;

    // Get and return the DataUrl
    var dataURL = canvas.toDataURL('image/jpeg');
    console.log("dataURL: ");
    console.log(dataURL);
    return dataURL;
}