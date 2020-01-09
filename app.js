// Going to be used.
// $("#debug").html("")
// var browserStr = navigator.userAgent;
// if (browserStr.includes("com.oracle.ofsc") && browserStr.includes("android")) {
//     $("#debug").append("<hr><br>* Android App Detected *");
// }
// else if (!browserStr.includes("com.oracle.ofsc") && browserStr.includes("Android")) {
//     $("#debug").append("<hr><br>* Android Browser Detected *");
// }


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

/* input photo parameters */
var paramImage
var paramDateTime;
var paramLat;
var paramLong;
var paramLatLong

var paramResize;
var paramMaxWidth;
var paramMaxHeight;

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


// READY FUNCTION ("sendInitData": true wasn't in documentation...)
window.onload = function ready(event) {
    // Send READY payload
    console.log("Begin ready()");
    var payload = `{
        "apiVersion": 1,
        "method": "ready",
        "sendInitData": true,
        "showHeader": true,
        "enableBackButton": true
    }`;
    // targetOrigin: '*' = no preference
    console.log("End ready()");
    window.parent.postMessage(payload, "*"); //targetOrigin);
}

function getPostMessageData(event) {
    var data = JSON.parse(event.data);
    // console.log("Message data: " + data);
    console.log("Message data: ");
    // console.log(JSON.stringify(data));
    console.log(data);
    // console.log(event.data);

    switch (data.method) { 
        // One case per method/call
        case 'init': 
            console.log("Received INIT Method");
            pluginInit(data);
            break; 
        case 'open':
            console.log("Received OPEN Method");
            pluginOpen(data); 
            break; 
        case 'wakeup':
            console.log("Received WAKEUP Method");
            pluginSleep(data); 
            break; 
        default: 
            console.log("Received Unknown Method (Error)");
            showError();
    }
};
window.addEventListener("message", getPostMessageData, false);

function pluginInit(data) {
    // INIT Request
    console.log("Begin pluginInit()");

    // console.log("Data: ");
    // console.log(data);

    console.log("End pluginInit()");

    pluginInitEnd();
}

function pluginInitEnd() {
    // INIT-END Response
    // console.log("Begin pluginInitEnd()");

    var payload = `{
        "apiVersion": 1,
        "method": "initEnd",
        "wakeupNeeded": true
    }`;
    window.parent.postMessage(payload, "*");
    console.log("INIT END Sent");
    console.log("-------------------------------");
}

function pluginOpen(data) {
    // OPEN Request
    console.log("Begin pluginOpen()");

    // console.log("Data: ");
    // console.log(data);

    parseOpenPayload(data);

    console.log("End pluginOpen()");
}

function pluginClose(event) {
    // CLOSE Response
    console.log("Begin pluginClose()");

    // Create js object that is sent on close
    var payload = {
        apiVersion: 1,
        method: 'close',
        activity: {
            aid: gActivityID
        }
    }

    // Only add parameters that were set via input payload

    // Return depending on if passed in 
    if (paramImage != null) {
        console.log("Final DataURL: ");
        console.log("gDataURL = ", gDataURL);

        var blobOutput = dataURItoBlob(gDataURL);
        console.log("Final Blob Output: ");
        console.log(blobOutput);

        payload.activity[paramImage] = {
            fileName: config.FILE_NAME + '.jpg',
            fileContents: blobOutput
        }
    }
    else {
        console.log("Error: no image field passed in through parameters");
        // Exit/throw error somehow. should have already been caught in openParse();
    }
    if (paramDateTime != null) {
        payload.activity[paramDateTime] = gDateTime;
    }
    // Convert all 
    if (paramLat != null) {
        // payload.activity[GPS_LAT_FIELD] = parseFloat(gLat).toFixed(6);
        payload.activity[paramLat] = gLat.toString();
    }
    if (paramLong != null) {
        // payload.activity[GPS_LONG_FIELD] = parseFloat(gLong).toFixed(6);
        payload.activity[paramLong] = gLong.toString();
    }
    if (paramLatLong != null) {
        payload.activity[paramLatLong] = gLatLong;
    }

    console.log("Payload to send: ");
    console.log(JSON.stringify(payload));

    window.parent.postMessage(payload, "*");
    console.log("CLOSE Sent");
}

function pluginWakeup(data) {
    // INIT Request
    console.log("Begin pluginWakeup()");

    // console.log("Data: ");
    // console.log(data);

    console.log("End pluginWakeup()");

    pluginSleep();
}

function pluginSleep() {
    // INIT-END Response
    console.log("Begin pluginSleep()");

    var payload = `{
        "apiVersion": 1,
        "method": "sleep",
        "wakeupNeeded": true
    }`;
    window.parent.postMessage(payload, "*");
    console.log("Plugin Sleep Sent");
    console.log("-------------------------------");
}

function showError(errorData) {
    // Init End Response
    console.log("Begin showError()");

    console.log("ERROR Data: ");
    console.log(JSON.stringify(errorData));

    console.log("End showError()");
}
/*** End of OFSC Plugin Framework Calls ***/

/*** -------- ***/

/*** Begin Main Logic Functions ***/

function parseOpenPayload(payload) {
    console.log("Begin parseOpenPayload()");
    // console.log(payload);

    /* Separate into checking 'activity' and checking 'openParams' */
    
    console.log("localStorage: ", window.localStorage);
    console.log(navigator);
    
    // console.log(payload.openParams);
    console.log("Begin Parsing Parameters:");
    // Check what 'Parameters' are passed in to see if they should be returned
    // There values are what OFSC fields we store them in
    for (let key of Object.keys(payload.openParams)) {
        switch(key) {
            case IMAGE_FIELD:
                console.log(IMAGE_FIELD + " found");
                paramImage = payload.openParams[key];
                break;
            case DATE_TIME_FIELD:
                console.log(DATE_TIME_FIELD + " found");
                paramDateTime = payload.openParams[key];
                break;
            case GPS_LAT_FIELD:
                console.log(GPS_LAT_FIELD + " found");
                paramLat = payload.openParams[key];
                break;
            case GPS_LONG_FIELD:
                console.log(GPS_LONG_FIELD + " found");
                paramLong = payload.openParams[key];
                break;
            case GPS_LAT_LONG_FIELD:
                console.log(GPS_LAT_LONG_FIELD + " found");
                paramLatLong = payload.openParams[key];
                break;
            case RESIZE_IMAGE:
                console.log(RESIZE_IMAGE + " found");
                paramResize = (payload.openParams[key]).toLowerCase();
                break;
            case MAX_WIDTH:
                console.log(MAX_WIDTH + " found");
                paramMaxWidth = payload.openParams[key];
                break;
            case MAX_HEIGHT:
                console.log(MAX_HEIGHT + " found");
                paramMaxHeight = payload.openParams[key];
                break;
            default:
                console.log("Non matching 'OFSC parameter':" + "'" + key + "', please correct in the settings");
        } 
    }
    console.log("End Parsing Parameters");

    // Validate parameters and config values
    // Load default values from config file if no passed in as parameters
    if (paramImage == null) {
        console.log("ERROR: No Image Parameter Detected");
        noImageParameter = true
        // Disable fields as error has been found
        // Disable browse button
        document.getElementById("files").disabled = true;
        // Disable 'Clear' button'
        document.getElementById("clear").disabled = true;
        // Disable 'Show Camera' button'
        document.getElementById("loadCanvas").disabled = true;

        // Update error div
        $("#error").html("");
        $("#error").css("color", "red");
        $("#error").append("Error: No Mandatory Image Parameter detected, please correct in OFSC settings");
    }
    // If resize variables aren't in parameters use defaults from config file
    // Validate config file settings
    if (paramResize == null) {
        console.log("No "+ RESIZE_IMAGE + " OFSC parameter detected, loading default value from config file");
        if (config.RESIZE == null || (config.RESIZE != "yes" && config.RESIZE != "no") ) {
            console.log("Error: Invalid/No 'RESIZE' setting found in config file");
            $("#error").css("color", "red");
            $("#error").append("<br>Error: No/Invalid 'RESIZE' setting found in config file");
            // Disable browse button
            document.getElementById("files").disabled = true;
            // Disable 'Clear' button'
            document.getElementById("clear").disabled = true;
            // Disable 'Show Camera' button'
            document.getElementById("loadCanvas").disabled = true;     
        }
        else {
            paramResize = config.RESIZE;
            console.log("Resize using config value:");
            console.log(paramResize);
        }
    }
    if (paramMaxWidth == null ) {
        console.log("No "+ MAX_WIDTH + " OFSC parameter detected, loading default value from config file");
        if (config.RESIZE_MAX_WIDTH == null || isNaN(config.RESIZE_MAX_WIDTH)) {
            console.log("Error: Invalid/No 'RESIZE_MAX_WIDTH' setting found in config file");
            $("#error").css("color", "red");
            $("#error").append("<br>Error: No/Invalid 'RESIZE_MAX_WIDTH' setting found in config file");
            // Disable browse button
            document.getElementById("files").disabled = true;
            // Disable 'Clear' button'
            document.getElementById("clear").disabled = true;     
            // Disable 'Show Camera' button'
            document.getElementById("loadCanvas").disabled = true;   
        }
        else {
            paramMaxWidth = config.RESIZE_MAX_WIDTH;
            console.log("MaxWidth using config value:");
            console.log(paramMaxWidth);
        }
    }
    if (paramMaxHeight == null) {
        console.log("No "+ MAX_HEIGHT + " OFSC parameter detected, loading default value from config file");
        if (config.RESIZE_MAX_HEIGHT == null || isNaN(config.RESIZE_MAX_HEIGHT)) {
            console.log("Error: Invalid/No 'RESIZE_MAX_HEIGHT' setting found in config file");
            $("#error").css("color", "red");
            $("#error").append("<br>Error: No/Invalid 'RESIZE_MAX_HEIGHT' setting found in config file");
            // Disable browse button
            document.getElementById("files").disabled = true;
            // Disable 'Clear' button'
            document.getElementById("clear").disabled = true;        
        }
        else {
            paramMaxHeight = config.RESIZE_MAX_HEIGHT;
            console.log("MaxHeight: using config value:");
            console.log(paramMaxHeight);
        }
    }

    console.log("Start ACTIVITIES");
    // Check what 'Activities' are passed in to see if they should be returned
    gActivityID = payload.activity['aid'];
    console.log("Activity ID (aid): " + gActivityID);
    console.log("Payload: ");
    
    console.log(payload);
    console.log("End ACTIVITIES");

    console.log("End parseOpenPayload()");
}

// Read image file and parse/display it's metadata
function printOriginalFileSelect(evt) {
    // Parameter = File array

    $("#error").html('');

    // Show Loading Spinner
    $("#spinner").css("display", "inline-block");

    // File
    var file = evt.target.files[0]; // FileList object
    
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            // Disable submit button
            document.getElementById("submit").disabled = true;
            // Clear fields at start
            $("#error").html("");
            document.querySelector("#resized").src = "";

            // Set global data URL to submit to original image's incase resizing is skipped,
            // it will still be set
            gDataURL = e.target.result;

            exifObj = piexif.load(e.target.result);
            /* Get Latitude and Longtitude from the  Exif metadata */
            // Latitude
            // console.log("---")
            // latDirection: N
            var latDir = exifObj.GPS[1];
            // console.log(latDir);
            // latString: 37,1,53,1,1520,100
            var lat = exifObj.GPS[2][0][0] + "," + exifObj.GPS[2][0][1] + "," + exifObj.GPS[2][1][0] + "," + exifObj.GPS[2][1][1] + "," + exifObj.GPS[2][2][0] + "," + exifObj.GPS[2][2][1];
            // console.log(lat);

            // console.log("---");

            // Longtitude
            var longDir = exifObj.GPS[3];
            // console.log(longDir);
            var long = exifObj.GPS[4][0][0] + "," + exifObj.GPS[4][0][1] + "," + exifObj.GPS[4][1][0] + "," + exifObj.GPS[4][1][1] + "," + exifObj.GPS[4][2][0] + "," + exifObj.GPS[4][2][1];
            // console.log(long);

            // console.log("---");

            /* Convert coordinates to Decimal Degree Format */
            var ddLat = ConvertDMSToDD(lat, latDir);
            var ddLong = ConvertDMSToDD(long, longDir);
            var ddLatLong = ddLat + ", " + ddLong;

            // Check if there was an error converting the GPS coordinates
            if (ddLat == null) {                
                $("#error").css("color", "red");
                $("#error").append("<br>Error: Invalid Latitude Detected");
                gLatLong = null;
            }
            if (ddLong == null) {                
                $("#error").css("color", "red");
                $("#error").append("<br>Error: Invalid Longtitude Detected");
                gLatLong = null;
            }

            // Output Results
            gLat = ddLat;
            gLong = ddLong;
            gLatLong = ddLatLong;

            // DateTime
            var dateTime = exifObj["0th"]["306"];
            console.log(dateTime);

            // Output Result
            gDateTime = dateTime;

            // Log Results
            console.log("-----");
            console.log("Geo Data From Image: ");
            console.log("gLat: " + gLat);
            console.log("gLong: " + gLong);
            console.log("gLatLong: " + gLatLong);
            console.log("dateTime: " + gDateTime);
            console.log("-----");

            // Output Original Image's Metadata
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
            hasMetaData = true;
            $("#error").html("");
            // $("#error").css("color", "green");
            $("#error").append('<span style="color: green;"><br>Success: Metadata Detected<span>');
        }
        catch(err) {
            // $("#error").css("color", "red");
            console.log("Error: No/Missing Metadata Detected in Image");
            $("#error").html("");
            $("#error").append("No/Missing Metadata Detected in Image, adding metadata");
            hasMetaData = false;
        }
    };
    reader.readAsDataURL(file);

    // Delay as not working without
    setTimeout(function() {
        // All must be true to proceed
        if(hasMetaData && gLat != null && gLong != null) {
            console.log("MetaData Found");
            // Enable submit button and resize image if metadata
            console.log("Enabling submit button");
            document.getElementById("submit").disabled = false;
            if (paramResize == "yes") {
                resizeFile();
            }
            else {
                console.log("***Skip Resizing***");
            }
        }
        else {
            // Make sure submit button is still disabled as no metadata
            // console.log("Disabling submit button - as no metadata/gps coordinates invalid");

            console.log("Enabling submit button");
            document.getElementById("submit").disabled = false;

            /**** Inject Metadata from Browser into Original Image****/
            console.log("*** No Metadata Detected: Adding Metadata ***");

            // Get Browser Metadata
            console.log("@@@ CALLING GPS @@@");
            getLocation();
        }
    }, 500);
}

function getLocation() {
    console.log("Begin getLocation");

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } 
    else {
        console.log("Geolocation is not supported by this browser.");
        // $("#error").html("");
        $("#error").append("<br><span style='color: red'>Geolocation is not supported by this browser.</span>");
    }
}
function showPosition(position) {
    console.log("Begin showPosition");

    // Enable Browse Button as position has loaded
    document.getElementById("files").disabled = false;

    // Create date object to convert from Epoch to Human Readable
    var date = new Date(position.timestamp);
    
    // Offset = 60*x minutes
    // ie. -480 / 60 = 8 => gmt + 8
    // Return the time difference between UTC and local time, in minutes
    /** Doesn't need to be used **/
    // var offset = date.getTimezoneOffset()
    // console.log("offset: ");
    // console.log(offset);

    // console.log("offset: ");
    // console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // getMonth() is 0-indexed
    var dateStr = date.getFullYear() + ":" + (date.getMonth() + 1) + ":" + date.getDate();
    var dateTimeStr = date.getFullYear() + ":" + (date.getMonth() + 1) + ":" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    console.log(dateStr);
    console.log(dateTimeStr);

    // var latlong = position.coords.latitude + ", " + position.coords.longitude;

    console.log("@!Setting Lat/Long!@");
    // Export values to global variables
    gLat = position.coords.latitude;
    gLong = position.coords.longitude;
    gLatLong = position.coords.latitude + ", " + position.coords.longitude;
    gDateTime = dateTimeStr;
    gDate = dateStr;

    //----
    /* Call rest of browser exif now as vars have loaded */
    createBrowserExif();

    // Has MetaData in it
    console.log("Output exifObj: ");
    console.log(exifObj);
    
    // $("#error").css("color", "green");
    $("#error").html("");
    $("#error").append('<br><span style="color: green">MetaData has successfully been added</span>');
    $("#spinner").css("display", "none");

    // var originalImg = document.querySelector("#original");
    // exifObj = piexif.load(originalImg.src);

    if (paramResize == "yes") {
        console.log("**Resizing Browser Metadata Image**");

        resizeFile();

        var resizedImg = document.querySelector("#resized");

        console.log("Adding exif data into resized image..");

        // dump into bytes
        var exifBrowserBytes = piexif.dump(exifObj);
        // add exifObj into resized image...
        var browserDataURL = piexif.insert(exifBrowserBytes, resizedImg.src);

        // Clear resized image
        resizedImg.src = "";
        // Set resized image to new browser exif dataUrl
        resizedImg.src = browserDataURL;

        console.log("Exif data added..");

        // Export to global vars
        gDataURL = browserDataURL;
    }
    else {
        console.log("***Skip Resizing***");

        // Still need to add the geo data into the image.
        var originalImg = document.querySelector("#original");

        console.log("Adding exif data into resized image..");
        // dump into bytes
        var exifBrowserBytes = piexif.dump(exifObj);
        // add exifObj into resized image...
        var browserDataURL = piexif.insert(exifBrowserBytes, originalImg.src);

        console.log("Exif data added..");

        // Don't need to add the new dataURL to the original image, as gDataUrl is being exported

        // Export to global var
        gDataURL = browserDataURL;
    }

    // Enable submit button
    console.log("Enabling submit button");
    document.getElementById("submit").disabled = false;
}

function showError(error) {
    console.log("Begin showError");

    try {
        switch(error.code) {
        case error.PERMISSION_DENIED:
            // User denied the request for Geolocation
            $("#error").append('<br><span style="color: red;">Error: The request for Geolocation data was denied.</span>');
            break;
        case error.POSITION_UNAVAILABLE:
            $("#error").append('<br><span style="color: red;">Error: Location information is unavailable.<br>Please allow access in "App Permissions" in device settings and restart.</span>');
            break;
        case error.TIMEOUT:
            $("#error").append('<br><span style="color: red;">The request for Geolocation data timed out.</span>');
            break;
        case error.UNKNOWN_ERROR:
            $("#error").append('<br><span style="color: red;">An unknown error occurred.</span>');
            break;
        }
        $("#spinner").css("display", "none");
    }
    catch(e) {
        // console.log(e.toString());
        console.log("Initial Load Error (Ignore)"); 
    }
}

function createBrowserExif() {
    console.log("Begin createBrowserExif");

    console.log("Input Exif: ");
    console.log(exifObj);

    if (exifObj == undefined) {
        console.log("Current Image Exif Data Undefined");

        // Create Exif data from scratch
        var zerothIfd = {};
        var exifIfd = {};
        var gpsIfd = {};

        zerothIfd[piexif.ImageIFD.DateTime] = gDateTime;
        zerothIfd[piexif.ImageIFD.Software] = "Piexifjs";

        exifIfd[piexif.ExifIFD.DateTimeOriginal] = gDateTime;
        exifIfd[piexif.ExifIFD.DateTimeDigitized] = gDateTime;
        exifIfd[piexif.ExifIFD.PixelXDimension] = originalW;
        exifIfd[piexif.ExifIFD.PixelYDimension] = originalH;

        gpsIfd[piexif.GPSIFD.GPSDateStamp] = gDate;

        // Converts Lat/Long to DMS
        var lat = gLat;
        var lng = gLong;
        gpsIfd[piexif.GPSIFD.GPSLatitudeRef] = lat < 0 ? 'S' : 'N';
        gpsIfd[piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(lat);
        gpsIfd[piexif.GPSIFD.GPSLongitudeRef] = lng < 0 ? 'W' : 'E';
        gpsIfd[piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(lng);

        exifObj = {"0th":zerothIfd, "Exif":exifIfd, "GPS":gpsIfd};

        console.log("Exif data has been added");
    }
    else {
        // For each metadata field generated by the browser check if it already exists in the exif data
        // if it doesn't add it in

        // 0th
        if (exifObj["0th"][piexif.ImageIFD.DateTime] != undefined) {
            console.log("$Datetime detected, leave");
        }
        else {
            console.log("$No Datetime detected, add");
            exifObj["0th"][piexif.ImageIFD.DateTime] = gDateTime;
        }
        console.log(exifObj["0th"][piexif.ImageIFD.DateTime]);

        if (exifObj["0th"][piexif.ImageIFD.Software]) {
            console.log("$Software detected, leave");
        }
        else {
            console.log("$No Software detected, add");
            exifObj["0th"][piexif.ImageIFD.Software] = "Piexifjs";
        }
        console.log(exifObj["0th"][piexif.ImageIFD.Software]);

        // Exif
        if (exifObj["Exif"][piexif.ExifIFD.DateTimeOriginal]) {
            console.log("$DateTimeOriginal detected, leave");
        }
        else {
            console.log("$No DateTimeOriginal detected, add");
            exifObj["Exif"][piexif.ExifIFD.DateTimeOriginal] = gDateTime;
        }
        console.log(exifObj["Exif"][piexif.ExifIFD.DateTimeOriginal]);

        if (exifObj["Exif"][piexif.ExifIFD.PixelXDimension]) {
            console.log("$PixelXDimension detected, leave");
        }
        else {
            console.log("$No PixelXDimension detected, add");
            exifObj["Exif"][piexif.ExifIFD.PixelXDimension] = originalW;
        }
        console.log(exifObj["Exif"][piexif.ExifIFD.PixelXDimension]);

        if (exifObj["Exif"][piexif.ExifIFD.PixelYDimension]) {
            console.log("$PixelYDimension detected, leave");
        }
        else {
            console.log("$No PixelYDimension detected, add");
            exifObj["Exif"][piexif.ExifIFD.PixelYDimension] = originalH;
        }
        console.log(exifObj["Exif"][piexif.ExifIFD.PixelYDimension]);

        // GPS
        if (exifObj["GPS"][piexif.GPSIFD.GPSDateStamp]) {
            console.log("$GPSDateStamp detected, leave");
        }
        else {
            console.log("$No GPSDateStamp detected, add");
            exifObj["GPS"][piexif.GPSIFD.GPSDateStamp] = gDate;
        }
        console.log(exifObj["GPS"][piexif.GPSIFD.GPSDateStamp]);

        // Converts Lat/Long to DMS
        var lat = gLat;
        var lng = gLong;

        if (exifObj["GPS"][piexif.GPSIFD.GPSLatitudeRef]) {
            console.log("$GPSLatitudeRef detected, leave");
        }
        else {
            console.log("$No GPSLatitudeRef detected, add");
            exifObj["GPS"][piexif.GPSIFD.GPSLatitudeRef] = lat < 0 ? 'S' : 'N';
        }
        console.log(exifObj["GPS"][piexif.GPSIFD.GPSLatitudeRef]);

        if (exifObj["GPS"][piexif.GPSIFD.GPSLatitude]) {
            console.log("$GPSLatitude detected, leave");
        }
        else {
            console.log("$No GPSLatitude detected, add");
            exifObj["GPS"][piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(lat);
        }
        console.log(exifObj["GPS"][piexif.GPSIFD.GPSLatitude]);

        if (exifObj["GPS"][piexif.GPSIFD.GPSLongitudeRef]) {
            console.log("$GPSLongitudeRef detected, leave");
        }
        else {
            console.log("$No GPSLongitudeRef detected, add");
            exifObj["GPS"][piexif.GPSIFD.GPSLongitudeRef] = lng < 0 ? 'W' : 'E';
        }
        console.log(exifObj["GPS"][piexif.GPSIFD.GPSLongitudeRef]);

        if (exifObj["GPS"][piexif.GPSIFD.GPSLongitude]) {
            console.log("$GPSLongitude detected, leave");
        }
        else {
            console.log("$No GPSLongitude detected, add");
            exifObj["GPS"][piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(lng);
        }
        console.log(exifObj["GPS"][piexif.GPSIFD.GPSLongitude]);
    }
    console.log("End createBrowserExif()..");
}

/************/

function ConvertDMSToDD(gpsString, direction) {
    // Input is a csv string

    // Separate into array
    var inputArray = gpsString.split(',');

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
        console.log("Error: GPS Coordinatees are in an invalid format")
        dd = null;
    }
    return dd;
}

function displayImage(evt) {
    var originalImg = document.querySelector("#original");
    var f = evt.target.files[0]; // FileList object

    var reader = new FileReader();
    reader.onloadend = function(e) {

        $("#original-xy").html("");
        // Create a 'fake' image to get the raw dimensions for original image
        var img = new Image();
        img.onload = function(){
            originalW = this.width;
            originalH = this.height;
            $("#original-xy").append("Original: " + this.width + " x " + this.height);
        };
        // Load the fake image otherwise its onload code wont work
        img.src = e.target.result
        // Set the original image to the dataurl
        originalImg.src = e.target.result
    }
    reader.readAsDataURL(f);
}

function clearImage(evt) {
    console.log("Image cleared");

    // Clear the file picker
    $("#files").val("");

    // Clear the error message
    $("#error").html("");

    // Clear the images
    document.querySelector("#original").src = "";
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
    document.getElementById("camera--trigger").disabled = true;

}

function resizeFile() {
    // Get values
    var originalImg = document.querySelector("#original");
    var resizedImg = document.querySelector("#resized");

    var height = paramMaxHeight;
    var width = paramMaxWidth;

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
    exifObjEditted = overrideDimensions(exifObj, resizedW, resizedH);
    // Dump the exifObject back into bytes
    var exifEdittedBytes = piexif.dump(exifObjEditted);
    // Combine the bytes of the original image's exifObject into the resized image's dataURL,
    // returning a new dataURL
    var resizedEdittedURL = piexif.insert(exifEdittedBytes, resizedImg.src);

    // console.log("Exif !! - end of resized()");
    // console.log(exifObj);

    // Save the finished resized image's dataURL to the global variable 
    gDataURL = resizedEdittedURL;
    
    printResizedCopyFileSelect(resizedEdittedURL, "Resized Metadata");
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
    var canvas = document.createElement('canvas');
    // ctx is still part of the canvas
    var ctx = canvas.getContext('2d');
    // Set the canvas to the wanted dimensions
    canvas.height = outputHeight;
    canvas.width = outputWidth;

    // Draw the image to the same dimensions wanted (also same as the canvas)
    // drawImage(img,x,y,width,height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Clear the dimensions div incase of consecutive uploads
    $("#resized-xy").html("");
    $("#resized-xy").append("Resized Image Dimensions: " + canvas.width + " x " + canvas.height);

    // Save the resized image height in global variables
    resizedW = canvas.width;
    resizedH = canvas.height;

    // Get and return the DataUrl
    var dataURL = canvas.toDataURL('image/jpeg');

    return dataURL;
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

    $("#spinner").css("display", "none");
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

function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], {type: mimeString});
}


/* Take Photo From Canvas - Code */

// Set constraints for the video stream
var constraints = { video: { height: config.IMAGE_HEIGHT, facingMode: "environment" }, audio: false };
// Define constants
const cameraView = document.querySelector("#camera--view"),
    cameraOutput = document.querySelector("#camera--output"),
    cameraSensor = document.querySelector("#camera--sensor"),
    cameraTrigger = document.querySelector("#camera--trigger")

// Access the device camera and stream to cameraView
function cameraStart() {

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
        track = stream.getTracks()[0];
        cameraView.srcObject = stream;
    })
    .catch(function(error) {
        console.error("Error: Unable to access camera", error);
        console.log("Error: Unable to access camera", error);

        $("#camera--text").append('<br><span style="color: red">Error: Unable to access camera.<br>Please allow access in "App Permissions" in device settings and restart.</span>');
    });

    $("#camera--view").css("display", "inline");
    document.getElementById("camera--trigger").disabled = false;
}

// Take a picture when cameraTrigger is tapped
cameraTrigger.onclick = function() {
    
    $("#spinner").css("display", "inline-block");

    $("#camera--text").html("");
    $("#camera--text").append('<span style="color: green">Picture Taken!</span>');

    cameraSensor.width = cameraView.videoWidth;
    cameraSensor.height = cameraView.videoHeight;
    cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
    
    // get JPEG image from canvas
    var jpegData = cameraSensor.toDataURL("image/jpeg", 1.0);

    var originalImg = document.querySelector("#original");
    var resizedImg = document.querySelector("#resized");

    // Create a 'fake' image to get the raw dimensions for original image
    var img = new Image();
    img.onload = function(){
        originalW = this.width;
        originalH = this.height;
        console.log("originalW = " + originalW);
        console.log("originalH = " + originalH);

        // $("#debug").append("<br>* Original W: " + originalW);
        // $("#debug").append("<br>* Original H: " + originalH);

        console.log("Image Loaded: x=" + originalW + ", y=" + originalH);

        console.log("Setting original and resized image to canvas");
        originalImg.src = jpegData;
        resizedImg.src = jpegData;

        // Swap metadata
        console.log("Using canvas camera so must add metadata");

        // Get Browser Metadata
        console.log("@ CALLING GPS @");
        // Load Exif Data from original image
        exifObj = piexif.load(originalImg.src);
        getLocation();
        
        // Resize - is called by getLocation()
        // resizeFile();
    };

    // Load the fake image otherwise its onload code wont work
    img.src = jpegData;
    
};

// Start the video stream when the window loads
// window.addEventListener("load", cameraStart, false);
document.getElementById("loadCanvas").addEventListener("click", cameraStart, false);