// Add the version number to the html tag
$('#versionNo').append(config.VERSION_NUMBER);

var gFilePicker;

// New Button Functions
function cameraSelected(event) {
    // Only Camera being used so inject browser metadata if not found.
    // As per normal...

    gFilePicker = event;
    // printOriginalFileSelect(event, inject=true);
    printOriginalFileSelect(event, true);
    // displayImage(event);
}

function fileOrBothSelected(event) {
    // Both or File Browser used so reject submit if metadata not found.
    
    gFilePicker = event;
    // printOriginalFileSelect(event, inject=false);
    printOriginalFileSelect(event, false);
    // displayImage(event);
}

/* CONSTANTS
 * Parameters to look for in the OFSC open payload
 * Change variable names to match OFSC parameters.
 */

// This is always set to "aid" in the open payload
const ACTIVITY_ID_FIELD = "aid";

// Change to match OFSC parameters in the Open() payload, if needed.
const IMAGE_FIELD = "IMAGE_FIELD";
const DATE_TIME_FIELD = "DATE_TIME_FIELD";
const GPS_LAT_FIELD = "GPS_LAT_FIELD";
const GPS_LONG_FIELD = "GPS_LONG_FIELD";
const GPS_LAT_LONG_FIELD = "GPS_LAT_LONG_FIELD";
const RESIZE_IMAGE = "RESIZE_IMAGE";
const MAX_WIDTH = "MAX_WIDTH";
const MAX_HEIGHT = "MAX_HEIGHT";

// Extra Optional Image Field - For Preview.
const IMAGE_FIELD_2 = "IMAGE_FIELD_2";
// Secure Parameters
const ENDPOINT_FIELD = "endpoint";
const SECRET_FIELD = "secret";
const USER_FIELD = "user";
//  New
const MANDATORY_FIELD = "MANDATORY_FIELD";

/* input photo parameters */
var paramImage
var paramDateTime;
var paramLat;
var paramLong;
var paramLatLong

var paramResize;
var paramMaxWidth;
var paramMaxHeight;

var paramMandField;

// New
var paramImage2;

// Secure parameter values
var paramEndpoint;
var paramSecret;
var paramUser;

// output photo parameters
var gActivityID;
var gDateTime;
var gDate;
var gLat;
var gLong;
var gLatLong;
var gDataURL;

// Initialize Global Variables
var exifObj;
// var file;
var hasMetaData = false;

/* Original and Resized Image Height and Width */
// Original image values
var originalW;
var originalH;
// Resized image values
var resizedW;
var resizedH;

var gImageParamValue;
var gImage2FieldInActivityPayload = false;


function eraseImage() {
    // Send the Close() function but clear file data by submitting null.
    // CLOSE Response
    console.log("Begin pluginClose() - eraseImage()");

    // Create js object that is sent on close
    var payload = {
        apiVersion: 1,
        method: 'close',
        activity: {
            aid: gActivityID
        }
    }

    // Only add parameters that were set via input payload

    if (paramMandField != null) {
        payload.activity[paramMandField] = null;
    }

    // Return depending on if passed in 
    if (paramImage != null) {
        payload.activity[paramImage] = null;
        // payload.activity[paramImage] = {
        //     fileName: config.FILE_NAME + '.jpg',
        //     // empty file contents doesn't work with: "", null, empty blob, no fileContents
        //     fileContents: null
        // }
    }
    else {
        console.log("Error: no image field passed in through parameters");
        // Exit/throw error somehow. should have already been caught in openParse();
    }

    // Return depending on if passed in
    // Debug
    console.log("Checking ImageParam2Val: ");
    console.log(paramImage2);
    console.log(gImage2FieldInActivityPayload);
    if (paramImage2 != null && gImage2FieldInActivityPayload) {
        console.log("adding paramImage2 to close() payload");
        payload.activity[paramImage2] = null;
    }

    // Delete the local storage that holds the image
    console.log("Deleting image from local storage: ");
    localStorage.removeItem("imageDataURL");

    console.log("Payload to send: ");
    console.log(JSON.stringify(payload));

    window.parent.postMessage(payload, "*");
    console.log("CLOSE Sent (Erase Function)");    
}

// *** Calls Resize

// Read image file and parse/display it's metadata
function printOriginalFileSelect(evt, inject) {
    // Parameter = File array

    $("#error").html('');

    // Disable clear button
    // document.getElementById("clear").disabled = true;

    // File
    var file = evt.target.files[0]; // FileList object
    
    var reader = new FileReader();
    reader.onload = function(e) {
        gDataURL = e.target.result;

        var img = new Image();

        img.onload = function() 
        {
            console.log("Fake image loaded");
            originalW = this.width;
            originalH = this.height;
            console.log("originalW: " + originalW);
            console.log("originalH: " + originalH);

            // ------------------------------------

            exifObj = piexif.load(e.target.result);

            var originalImg = document.querySelector("#original");
            var resizedImg = document.querySelector("#resized");

            console.log("Adding image to original");
            originalImg.src = gDataURL;

            resizeFile();
            console.log("Adding image to resized");
            resizedImg.src = gDataURL;

            console.log("***ENDING ONLOADEND--");

            // Disable Spinner
            $("#spinner").css("display", "none");            
            // Enable Submit
            document.getElementById("submit").disabled = false;

        }// End img load
        
        img.src = gDataURL;
        console.log("***ENDING ONLOAD");
    };
    console.log("***Start reading file");
    reader.readAsDataURL(file);
    console.log("***End reading file");

}

function resizeFile() {
    // Get values
    var originalImg = document.querySelector("#original");
    var resizedImg = document.querySelector("#resized");

    var height = 200;
    var width = 200;

    // console.log("height: ");
    // console.log(height);
    // console.log("width: ");
    // console.log(width);
    resizedImg.src = "";

    console.log("height: ");
    console.log(height);
    console.log("width: ");
    console.log(width);

    console.log("ogImage1111");
    console.log(originalImg);
    // Draw the original image to a resized canvas - outputs a dataURL
    resizedImg.src = resize(originalImg, height, width);

    /* Copy the Original Image's metadata into the Resized Image */

    // exifObj has already been set by getLocation()
    // getLocation();
    
    // Override the pixelX and pixelY fields in the original image's exifObject
    // exifObjEditted = overrideDimensions(exifObj, resizedW, resizedH);
    // Dump the exifObject back into bytes
    // var exifEdittedBytes = piexif.dump(exifObjEditted);
    // Combine the bytes of the original image's exifObject into the resized image's dataURL,
    // returning a new dataURL

    // DEBUG:
    // console.log("exifEdittedBytes: ");
    // console.log(exifEdittedBytes);

    // var resizedEdittedURL = piexif.insert(exifEdittedBytes, resizedImg.src);

    // console.log("Exif !! - end of resized()");
    // console.log(exifObj);

    // Save the finished resized image's dataURL to the global variable 
    // gDataURL = resizedEdittedURL;

    gDataURL = resizedImg.src;

    $("#error").append("<br>resizedImg Height: " +  resizedImg.height);
    $("#error").append("<br>resizedImg Width: " +  resizedImg.width);

    resizedImg.height = 150;
    resizedImg.width = 200;

    $("#error").append("<br>resizedImg Height: " +  resizedImg.height);
    $("#error").append("<br>resizedImg Width: " +  resizedImg.width);
    

    // Complete - Enable Submit Button
    
    // printResizedCopyFileSelect(resizedEdittedURL, "Resized Metadata");
}

function resize(image, wantedHeight, wantedWidth) {
    // Get the current image dimensions
    var originalHeight = originalH;
    var originalWidth = originalW;
    var heightOrWidth;

    var aspectWidth;
    var aspectHeight;
    var outputWidth
    var outputHeight

    // If equal shouldn't matter
    if (wantedHeight > wantedWidth) {
        heightOrWidth = "h"
    }
    else {
        heightOrWidth = "w"
    }

    // Calculate the Aspect Ratio = Width / Height
    var aspectRatio = originalWidth / originalHeight;

    console.log("Original Height = " + originalHeight);
    console.log("Original Width = " + originalWidth);
    console.log("Aspect Ratio = " + aspectRatio);

    // Keep the same aspect ratio when resizing.
    // newWidth = aspectRatio * height
    // Fix the height or the width
    if (heightOrWidth == "h") {
        console.log("----------------------------");
        console.log("Height Fixed");

        outputHeight = wantedHeight;
        aspectWidth = wantedHeight * aspectRatio;
        outputWidth = aspectWidth;
    }
    else if (heightOrWidth == "w") {
        console.log("----------------------------");
        console.log("Width Fixed");

        outputWidth = wantedWidth;
        aspectHeight = wantedWidth / aspectRatio;
        outputHeight = aspectHeight;
    }

    console.log("----------------------------");

    // Check that both aspectHeight and aspectWidth are less than wanted
    if (outputHeight > wantedHeight) {
        console.log("outputHeight > wantedHeight");
        console.log(outputHeight + " > " + wantedHeight);

        // Recalculate Width based on wantedHeight
        outputWidth = wantedHeight * aspectRatio;
        // Set height to wantedHeight
        outputHeight = wantedHeight;

        console.log("----------------------------");
        console.log("New Width:");
        console.log(outputWidth);
        console.log("New Height:");
        console.log(outputHeight);
    }
    else if (outputWidth > wantedWidth) {
        // Recalculate height based on wantedWidth
        console.log("outputWidth > wantedWidth");
        console.log(outputWidth + " > " + wantedWidth);

        // Recalculate Height based on wantedWidth
        outputHeight = wantedWidth / aspectRatio;
        // Set Width to wantedWidth
        outputWidth = wantedWidth;

        console.log("----------------------------");
        console.log("New Width:");
        console.log(outputWidth);
        console.log("New Height:");
        console.log(outputHeight);
    }

    console.log("Height = " + outputHeight);
    console.log("Width = " + outputWidth);
    console.log("Ratio = " + outputWidth / outputHeight);



    console.log("----------------------------");

    // Create a new canvas
    // var canvas = document.createElement('canvas');

    // var canvas = document.getElementById("canvasTest");
    // // ctx is still part of the canvas
    // var ctx = canvas.getContext('2d');
    // // Set the canvas to the wanted dimensions
    // canvas.height = outputHeight;
    // canvas.width = outputWidth;

    // // Draw the image to the same dimensions wanted (also same as the canvas)
    // // drawImage(img,x,y,width,height);
    // // ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    // ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // // Clear the dimensions div incase of consecutive uploads
    // $("#resized-xy").html("");
    // $("#resized-xy").append("Resized Image Dimensions: " + canvas.width + " x " + canvas.height);

    // // Save the resized image height in global variables
    // resizedW = canvas.width;
    // resizedH = canvas.height;

    // $("#error").append("<br>canvas.height: " +  canvas.height);
    // $("#error").append("<br>canvas.width: " +  canvas.width);

    // // Get and return the DataUrl
    // var dataURL = canvas.toDataURL('image/jpeg');

    // var testImg = image;

    console.log("Calling loadImage()");
    loadImage(
        gDataURL,
        function(img) {
            document.body.appendChild(img);
            testImg = img;
            console.log(img);
        },
        { maxWidth: 300 } // Options
    );

    var scaledImage = loadImage.scale(
        image, // img or canvas element
        { maxWidth: 300 }
    );

    document.body.appendChild(scaledImage);

    console.log("Finished calling loadImage()");

    // setTimeout(function(){ 

    //     // ----
    //     // Create a new canvas
    //     var canvas = document.createElement('canvas');

    //     var canvas = document.getElementById("canvasTest");
    //     // ctx is still part of the canvas
    //     var ctx = canvas.getContext('2d');
    //     // Set the canvas to the wanted dimensions
    //     canvas.height = outputHeight;
    //     canvas.width = outputWidth;

    //     // Draw the image to the same dimensions wanted (also same as the canvas)
    //     // drawImage(img,x,y,width,height);
    //     // ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    //     ctx.drawImage(testImg, 0, 0, canvas.width, canvas.height);

    //     // Clear the dimensions div incase of consecutive uploads
    //     $("#resized-xy").html("");
    //     $("#resized-xy").append("Resized Image Dimensions: " + canvas.width + " x " + canvas.height);

    //     // Save the resized image height in global variables
    //     resizedW = canvas.width;
    //     resizedH = canvas.height;

    //     $("#error").append("<br>canvas.height: " +  canvas.height);
    //     $("#error").append("<br>canvas.width: " +  canvas.width);

    //     // Get and return the DataUrl
    //     var dataURL = canvas.toDataURL('image/jpeg');

        var dataURL = "";
        console.log(dataURL);
        return dataURL;
    // }, 3000);
}

function clearImage() {
    console.log("Image cleared");

    // Clear gDataURL
    gDataURL = "";

    // Enable both Browse buttons
    if (document.getElementById("filesCamera")) {
        document.getElementById("filesCamera").disabled = false;
    }
    document.getElementById("filesBrowse").disabled = false;

    // Enable Take a Picture
    if (document.getElementById("camera--trigger")) {
        document.getElementById("camera--trigger").disabled = false;            
    }

    // Enable Load Canvas Button
    if (document.getElementById("loadCanvas")) {
        document.getElementById("loadCanvas").disabled = false;            
    }

    // Clear exception checkbox
    $('#exception').prop('checked', false);
    // Hide exception checkbox
    $("#exceptionDiv").css("display", "none");

    // Clear the file picker
    $("#files").val("");

    // Clear the error message
    $("#error").html("");

    // Clear the images
    document.querySelector("#original").src = "";
    $("#original").css("display", "none");
    document.querySelector("#resized").src = "";

    // Clear the dimension Divs
    $("#original-xy").html("");
    $("#resized-xy").html("");

    // Clear the Metadata Divs
    $("#originalMetadata").html("");
    $("#resizedMetadataCopied").html("");

    document.getElementById("submit").disabled = true;

    // Clear new filepicker
    $('#files').next('.custom-file-label').html("Choose file");

    // Clear canvas camera and text
    $("#camera--view").css("display", "none");
    $("#camera--text").html("");
    // Disable Take a picture button
    if (document.getElementById("camera--trigger")) {
        document.getElementById("camera--trigger").disabled = true;
    }

    // Reset and enable the browse.. buttons
    if ($("#fileform1")[0]) {
        $("#fileform1")[0].reset();
    }
    $("#fileform2")[0].reset();

}

function printResizedCopyFileSelect(dataURL, header) {
    // Load the metadata URL into an object
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

    // Cant use as screws with async functions...
    // Disable spinner
    // $("#spinner").css("display", "none");

    // console.log("Enabling submit button [printResized]");
    // // Enable submit button
    // document.getElementById("submit").disabled = false;
}

function overrideDimensions(inExifData, pixelX, pixelY) {
    // pixelX and pixelY must be a number)
    for (var ifd in inExifData) {
        if (ifd == "thumbnail") {
            continue;
        }

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
    return inExifData;
}