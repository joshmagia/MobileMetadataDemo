// Add the version number to the html tag
$('#versionNo').append(config.VERSION_NUMBER);

// Used via front end
// $("#debug").html("")
// var browserStr = navigator.userAgent;
// if (browserStr.includes("com.oracle.ofsc") && browserStr.includes("android")) {
//     //$("#debug").append("<hr><br>* Android App Detected *");
// }
// else if (!browserStr.includes("com.oracle.ofsc") && browserStr.includes("Android")) {
//     //$("#debug").append("<hr><br>* Android Browser Detected *");
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

// Preview DataURL
var gSmallDataURL;

var gResizeCanvas;
var gResizedDataURL = null;

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


// New Button Functions
function cameraSelected(event) {
    // Only Camera being used so inject browser metadata if not found.

    // Disable logic
    $("#error").html('');
    
    // $("#original").css("display", "inline-block");

    // Show Loading Spinner
    $("#spinner").css("display", "inline-block");

    // An image has successfully been selected
    // Replace erase button with the clear button
    console.log("Hiding Erase button...");
    document.getElementById("erase").style.display = "none";
    console.log("Showing Clear button...");
    document.getElementById("clear").style.display = "inline-block";

    // Disable clear button
    document.getElementById("clear").disabled = true;

    // Disable both Browse buttons
    if (document.getElementById("filesCamera")) {
        document.getElementById("filesCamera").disabled = true;
    }
    document.getElementById("filesBrowse").disabled = true;

    // Disable Take a Picture
    if (document.getElementById("camera--trigger")) {
        document.getElementById("camera--trigger").disabled = true;            
    }
    // Disable Load Canvas Button
    if (document.getElementById("loadCanvas")) {
        document.getElementById("loadCanvas").disabled = true;            
    }


    var f = event.target.files[0]; // FileList object

    var reader = new FileReader();
    reader.onloadend = function(e) {

        // Create a fake image using the input file to get it height and width
        var img = new Image();
        img.onload = function(){
            // originalW = this.width;
            // originalH = this.height;
            if (this.width > this.height) {
                originalW = this.width;
                originalH = this.height;
            }
            else {
                originalW = this.height;
                originalH = this.width;                
            }

            console.log("originalH: " + originalH);
            console.log("originalW: " + originalW);

            console.log("Calling - preResizedImage");
            preResizedImage(event, true);
            console.log("Calling - displayImage");
            displayImage(event);
        };
        // Load the fake image otherwise its onload code wont work
        img.src = e.target.result;
    }
    reader.readAsDataURL(f);
}

function fileOrBothSelected(event) {
    // Both or File Browser used so reject submit if metadata not found.
    
    // Disable logic
    $("#error").html('');
    
    // $("#original").css("display", "inline-block");

    // Show Loading Spinner
    $("#spinner").css("display", "inline-block");

    // An image has successfully been selected
    // Replace erase button with the clear button
    console.log("Hiding Erase button...");
    document.getElementById("erase").style.display = "none";
    console.log("Showing Clear button...");
    document.getElementById("clear").style.display = "inline-block";

    // Disable clear button
    document.getElementById("clear").disabled = true;

    // Disable both Browse buttons
    if (document.getElementById("filesCamera")) {
        document.getElementById("filesCamera").disabled = true;
    }
    document.getElementById("filesBrowse").disabled = true;

    // Disable Take a Picture
    if (document.getElementById("camera--trigger")) {
        document.getElementById("camera--trigger").disabled = true;            
    }
    // Disable Load Canvas Button
    if (document.getElementById("loadCanvas")) {
        document.getElementById("loadCanvas").disabled = true;            
    }


    var f = event.target.files[0]; // FileList object

    var reader = new FileReader();
    reader.onloadend = function(e) {

        // Create a fake image using the input file to get it height and width
        var img = new Image();
        img.onload = function(){
            // originalW = this.width;
            // originalH = this.height;
            if (this.width > this.height) {
                originalW = this.width;
                originalH = this.height;
            }
            else {
                originalW = this.height;
                originalH = this.width;                
            }

            console.log("originalH: " + originalH);
            console.log("originalW: " + originalW);

            console.log("Calling - preResizedImage");
            preResizedImage(event, false);
            console.log("Calling - displayImage");
            displayImage(event);
        };
        // Load the fake image otherwise its onload code wont work
        img.src = e.target.result;
    }
    reader.readAsDataURL(f);
}



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

function pluginClose() {
    // CLOSE Response
    console.log("Begin pluginClose()");

    // $("#error").append("Started pluginClose()");

    if (gDataURL && gDataURL != "") {
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
            // Don't alter metadata if it has all the fields (event if override is checked)
            if ($('#exception').is(':checked') && !hasMetaData) {
                // Checked
                console.log("Exception checkbox value: " + $('#exception').is(':checked'));

                // Inject Current DataURI field to show exception.
                console.log("Injecting Exception into metadata field");

                console.log("gDataURL");
                console.log(gDataURL);
                // DataURI to Exif
                var localExifObj = piexif.load(gDataURL);
                // Edit Exif
                localExifObj["0th"][piexif.ImageIFD.Software] = "Exception";
                // Dump Exif data into bytes for the insert
                var localExifBytes = piexif.dump(localExifObj);
                // Insert new exif into the global data url
                gDataURL = piexif.insert(localExifBytes, gDataURL);

                console.log("Injection complete");
            }
            else {
                console.log("Exception 'Checked' but has all metadata so not altering...");
            }

            if (paramResize == "yes") {
                // Image has been resized so copy its new x and y into metadata fields
                console.log("Injecting Resized X & Y into metadata fields");

                // DataURI to Exif
                var localExifObj = piexif.load(gDataURL);
                // Edit Exif
                // exifObj["Exif"][piexif.ExifIFD.PixelXDimension]

                // Make Width the highest value
                if (gResizeCanvas.width > gResizeCanvas.height) {
                    // Exif Width
                    localExifObj["Exif"][piexif.ExifIFD.PixelXDimension] = gResizeCanvas.width;
                    // Exif Height
                    localExifObj["Exif"][piexif.ExifIFD.PixelYDimension] = gResizeCanvas.height;
                }
                else {
                    // Exif Width
                    localExifObj["Exif"][piexif.ExifIFD.PixelXDimension] = gResizeCanvas.height;
                    // Exif Height
                    localExifObj["Exif"][piexif.ExifIFD.PixelYDimension] = gResizeCanvas.width;
                }

                // Alter the orientation of the image
                // Portrait = 1? | LAndscape = 6?
                localExifObj["0th"][piexif.ImageIFD.Orientation] = 1;

                console.log("Updated Exif Object: ");
                console.log(localExifObj);

                // Dump Exif data into bytes for the insert
                var localExifBytes = piexif.dump(localExifObj);
                // Insert new exif into the global data url
                gDataURL = piexif.insert(localExifBytes, gDataURL);

            }

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

        // Mandatory Parameter that is optional - returns 1 on successful upload
        if (paramMandField != null) {
            payload.activity[paramMandField] = "1";
        }

        // Copy of Final Image to second field
        // Debug
        console.log("Checking gImage2FieldInActivityPayload: ");
        console.log(paramImage2);
        console.log(gImage2FieldInActivityPayload);

        if (paramImage2 != null && gImage2FieldInActivityPayload) {
            console.log("Adding final image to IMAGE_FIELD_2 field: ");

            payload.activity[paramImage2] = {
                fileName: config.FILE_NAME + '.jpg',
                fileContents: blobOutput
            }
        }

        // $("#error").append("<br>Storing local data");


        // Resize final dataURL in own variable for the preview image and store in local storage.
        // So doesn't error out if image is too big if they dont want it resized
        var originalImg = document.querySelector("#original");
        // var smallDataURL = resize(originalImg.src, 1000, 1000);        

        // Debug - Get size of final image and image preview
        var finalLength = parseInt((gDataURL).replace(/=/g,"").length * 0.75);
        console.log("Final Image Size: " + finalLength + " bytes");
        // $("#error").append("<br>Final Image Size: " + finalLength + " bytes");

        var previewLength = parseInt((gSmallDataURL).replace(/=/g,"").length * 0.75);
        console.log("Preview Image Size: " + previewLength + " bytes");
        // $("#error").append("<br>Preview Image Size: " + previewLength + " bytes");

        // Store the gSmallDataURL of image for preview in local storage
        try {
            localStorage.setItem("imageDataURL", gSmallDataURL);
        }
        catch (e) {
            $("#error").append("<br>Error browser local storage full - " + e);
            console.log("Error browser local storage full (imageDataURL) " + e);
        }

        try {
            localStorage.setItem("imageFieldName", paramImage);
        }
        catch (e) {
            $("#error").append("<br>Error: browser local storage full - " + e);
            console.log("Error browser local storage full (imageFieldName) " + e);
        }

        console.log("**Saving final image DataURL to Local Storage...");

        console.log("Payload to send: ");
        console.log(JSON.stringify(payload));        

        window.parent.postMessage(payload, "*");
        console.log("CLOSE Sent");
    }
    else {
        // Error User hit submit without a valid dataURL
        console.log("Error: No image to submit... (blank dataURL)");
        // Update Error message
        $("#error").html("");
        $("#error").append("Error: No image to submit. Please upload a new image and try again.");
    }
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
    
    // console.log("localStorage: ", window.localStorage);
    // console.log(navigator);

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
            case MANDATORY_FIELD:
                console.log(MANDATORY_FIELD + " found");
                paramMandField = payload.openParams[key];
                break;
            // New
            // const IMAGE_FIELD_2 = "IMAGE_FIELD_2";
            case IMAGE_FIELD_2:
                console.log(IMAGE_FIELD_2 + " found");
                paramImage2 = payload.openParams[key];
                break;
            default:
                console.log("Non matching 'OFSC parameter':" + "'" + key + "', please correct in the settings");
        } 
    }
    console.log("End Parsing Parameters");

    console.log("Start ACTIVITIES");
    // Check what 'Activities' are passed in to see if they should be returned
    // gActivityID = payload.activity['aid'];

    // Check if activity ID is in the open payload.
    if ( !(typeof payload.activity == 'undefined' || typeof payload.activity.aid == 'undefined') ) {
        // Activity ID Detect so on the 'Activity List' page

        // Show the Erase button
        console.log("Showing the 'Erase' button");
        document.getElementById("erase").style.display = "inline-block";

        // Update the local storage with the new aid
        try {
            localStorage.setItem("aid", payload.activity['aid']);
        }
        catch (e) {
            $("#error").append("<br>Error browser local storage full - " + e);
        }

        gActivityID = payload.activity['aid'];
        console.log("***Activity ID found in Open() payload, updating local storage: ");


        // Print out the found activity id for Mobile Testing
        // aid
        // $("#aid").append("aid: " + gActivityID.toString());
        // aid-message
        // $("#aid-message").append("***Activity ID found in Open() payload, updating local storage");

        console.log(gActivityID);

        // Get and save the the value of the image_parameter
        gImageParamValue = payload.activity[paramImage];
        console.log("gImageParamValue: ");
        console.log(gImageParamValue);

        // Check that image param 2 is in the activity payload
        gImage2FieldInActivityPayload = paramImage2 in payload.activity;
        console.log("**gImage2FieldInActivityPayload: ");
        console.log(gImage2FieldInActivityPayload);

        // Close Plugin - Prematurely
        // CLOSE Response
        // console.log("Closing Plugin Prematurely...");

        // // Create js object that is sent on close
        // var payload = {
        //     apiVersion: 1,
        //     method: 'close',
        //     activity: {
        //         aid: gActivityID
        //     }
        // }

        // console.log("Payload to send: ");
        // console.log(JSON.stringify(payload));

        // window.parent.postMessage(payload, "*");
        // console.log("CLOSE Sent");
    }
    else {
        // If not use the local storage version
        gActivityID = localStorage.getItem("aid");

        console.log("***NO Activity ID found in Open() payload, using local storage version");
        console.log(gActivityID);

        // aid
        // $("#aid").append("aid: " + gActivityID.toString());
        // aid-message
        // $("#aid-message").append("***NO Activity ID found in Open() payload, using local storage version");
    }

    console.log("Start SECURED DATA");

    console.log("Begin Parsing Secured Data");

    // console.log(payload.securedData);
    // console.log(payload.securedData[ENDPOINT_FIELD]);
    // console.log(payload.securedData[SECRET_FIELD]);
    // console.log(payload.securedData[USER_FIELD]);
    // Check if activity ID is in the open payload.
    if ( !(typeof payload.securedData == 'undefined' || typeof payload.securedData[ENDPOINT_FIELD] == 'undefined'
    || typeof payload.securedData[SECRET_FIELD] == 'undefined' || typeof payload.securedData[USER_FIELD] == 'undefined') ) {
        for (let key of Object.keys(payload.securedData)) {
            switch(key) {
                case ENDPOINT_FIELD:
                    console.log(ENDPOINT_FIELD + " found");
                    paramEndpoint = payload.securedData[key];
                    break;
                case SECRET_FIELD:
                    console.log(SECRET_FIELD + " found");
                    paramSecret = payload.securedData[key];
                    break;
                case USER_FIELD:
                    console.log(USER_FIELD + " found");
                    paramUser = payload.securedData[key];
                    break;
                default:
                    console.log("Non matching 'OFSC Secured Data Parameter':" + "'" + key + "', please correct in the settings");
            }
        }
        // console.log("... Shhh secret parameters ...");
        // console.log(paramEndpoint);
        // console.log(paramSecret);
        // console.log(paramUser);
    }
    else {
        console.log("Missing Secured Data Parameters, Cannot call API");
        // $("#error").append("<span style='color: red;'><br>Error: Missing 'Secured Data Parameters' detected, please check OFSC configuration</span>");
        $("#error").append("<br>Error: Missing 'Secured Data Parameters' detected, please check OFSC configuration");
    }

    /* END SECURE PARAMETERS */

    // Validate parameters and config values
    // Load default values from config file if no passed in as parameters
    if (paramImage == null) {
        console.log("ERROR: No Image Parameter Detected");
        noImageParameter = true
        // Disable fields as error has been found
        // Disable browse button
        // document.getElementById("files").disabled = true;
        if (document.getElementById("filesCamera")) {
            document.getElementById("filesCamera").disabled = true;
        }
        document.getElementById("filesBrowse").disabled = true;
        // Disable 'Clear' button'
        document.getElementById("clear").disabled = true;
        // Disable 'Show Camera' button'
        if (document.getElementById("loadCanvas")) {
            document.getElementById("loadCanvas").disabled = true;
        }

        // Update error div
        $("#error").html("");
        // $("#error").css("color", "red");
        $("#error").append("Error: No Mandatory Image Parameter detected, please correct in OFSC settings");
    }
    // If resize variables aren't in parameters use defaults from config file
    // Validate config file settings
    if (paramResize == null) {
        console.log("No "+ RESIZE_IMAGE + " OFSC parameter detected, loading default value from config file");
        if (config.RESIZE == null || (config.RESIZE != "yes" && config.RESIZE != "no") ) {
            console.log("Error: Invalid/No 'RESIZE' setting found in config file");
            // $("#error").css("color", "red");
            $("#error").append("<br>Error: No/Invalid 'RESIZE' setting found in config file");
            // Disable browse buttons
            if (document.getElementById("filesCamera")) {
                document.getElementById("filesCamera").disabled = true;
            }
            document.getElementById("filesBrowse").disabled = true;
            
            // Disable 'Clear' button'
            document.getElementById("clear").disabled = true;
            // Disable 'Show Camera' button'
            if (document.getElementById("loadCanvas")) {
                document.getElementById("loadCanvas").disabled = true;
            }   
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
            // $("#error").css("color", "red");
            $("#error").append("<br>Error: No/Invalid 'RESIZE_MAX_WIDTH' setting found in config file");
            // Disable browse buttons
            // document.getElementById("files").disabled = true;
            if (document.getElementById("filesCamera")) {
                document.getElementById("filesCamera").disabled = true;
            }
            document.getElementById("filesBrowse").disabled = true;
            // Disable 'Clear' button'
            document.getElementById("clear").disabled = true;     
            // Disable 'Show Camera' button'
            if (document.getElementById("loadCanvas")) {
                document.getElementById("loadCanvas").disabled = true;
            } 
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
            // $("#error").css("color", "red");
            $("#error").append("<br>Error: No/Invalid 'RESIZE_MAX_HEIGHT' setting found in config file");
            // Disable browse buttons
            // document.getElementById("files").disabled = true;
            if (document.getElementById("filesCamera")) {
                document.getElementById("filesCamera").disabled = true;
            }
            document.getElementById("filesBrowse").disabled = true;
            // Disable 'Clear' button'
            document.getElementById("clear").disabled = true;
        }
        else {
            paramMaxHeight = config.RESIZE_MAX_HEIGHT;
            console.log("MaxHeight: using config value:");
            console.log(paramMaxHeight);
        }
    }
    // Mandatory Parameter is optional
    // if (paramMandField == null) {
    //     console.log("ERROR: No 'Mandatory Field' Parameter Detected");
    //     // Disable fields as error has been found
    //     // Disable browse button
    //     if (document.getElementById("files")) {
    //         document.getElementById("files").disabled = true;
    //     }
    //     // Disable 'Clear' button'
    //     if (document.getElementById("clear")) {
    //         document.getElementById("clear").disabled = true;
    //     }
        
    //     // Disable 'Show Camera' button'
    //     if (document.getElementById("loadCanvas")) {
    //         document.getElementById("loadCanvas").disabled = true;
    //     }

    //     // Update error div
    //     $("#error").html("");
    //     $("#error").css("color", "red");
    //     $("#error").append("Error: No 'Mandatory Field' Parameter detected, please correct in OFSC settings");
    // }

    // // Check if activity ID is in local storage.
    // if (localStorage.aid) {
    //     // If it is save it to the global variable
    //     gActivityID = localStorage.getItem("aid");

    //     console.log("***Activity ID found in local storage: ");
    //     console.log(gActivityID);
    // }
    // else {
    //     // If not add it and use the payload version
    //     localStorage.setItem("aid", payload.activity['aid']);
    //     gActivityID = payload.activity['aid'];

    //     console.log("***NO Activity ID found in local storage, using the one in the open payload");
    //     console.log(gActivityID);    
    // }

    // Check if incoming payload contains value for the image field
    // No point trying to get a preview that could belong to another activity
    console.log("Checking Image Param Value:");
    console.log(gImageParamValue);

    if (gImageParamValue) {
        // Show Loading Spinner for Image Preview
        $("#spinner2").css("display", "inline-block");

        // 
        
        // Get image preview in local storage.
        var imagePreview = localStorage.getItem("imageDataURL");
        var imageFieldName = localStorage.getItem("imageFieldName");
        console.log("****************")
        console.log("Local Storage Image Preview: ");
        console.log(imagePreview);
        console.log("Local Storage Image field name: ");
        console.log(imageFieldName);
        console.log("****************")

        console.log("****************")
        console.log("Image OFSC field name: ");
        console.log(paramImage);
        // console.log("Local Storage Image field name: ");
        // console.log(imageFieldName);
        // If previous image is saved and image field name passed in is the same
        if (imagePreview && imageFieldName == paramImage) {
            // Previous image is saved ... Load a preview
            console.log("**Previous image found in local storage");
            console.log("**Opening preview...");

            $("#original").css("display", "inline-block");
            document.querySelector("#original").src = imagePreview;

            // Hide image preview spinner
            $("#spinner2").css("display", "none");
        }
        else {
            // Previous image not saved make API Call
            console.log("*NO previous image found in local storage");
            // MAKE IMAGE GET REQUEST... (This will turn off the spinner)
            callAPI();
        }  
    }    
    console.log("Activity ID (aid): " + gActivityID);

    console.log("Payload: ");
    console.log(payload);

    console.log("End ACTIVITIES");

    console.log("End parseOpenPayload()");
}

function callAPI() {
    // 1) Get Image Through REST API Call
    console.log("Making REST Call...");
    var restUrl = paramEndpoint + "/rest/ofscCore/v1/activities/" + gActivityID + "/" + paramImage;
    console.log("URL String: ");
    console.log(restUrl);

    // var user = "eaw_app_int_01@ssmportal.test";
    // var password = "15367add8bc85253616100a1be8a1296099e8fa7013bc15dec52b4b5cd661be9";

    // This solution works do not question it.
    var xmlHTTP = new XMLHttpRequest();

    xmlHTTP.open("GET", restUrl, true); // true = async
    xmlHTTP.setRequestHeader("Authorization", "Basic " + btoa(paramUser + ":" + paramSecret));
    xmlHTTP.setRequestHeader("Accept", "application/octet-stream");

    // Must include this line - specifies the response type we want
    xmlHTTP.responseType = 'arraybuffer'; // Must be async to use response type

    xmlHTTP.onloadend = function(e)
    {
        console.log("................Start................");
        $("#spinner2").css("display", "none");

        // console.log("Original Response: ");
        // console.log(this.response);

        var arr = new Uint8Array(this.response);
        // console.log("Int Array: ");
        // console.log(arr);

        // Convert the int array to a binary string
        // We have to use apply() as we are converting an *array*
        // and String.fromCharCode() takes one or more single values, not
        // an array.
        var rawImage = String.fromCharCode.apply(null, arr);
        // console.log("Binary String: ");
        // console.log(rawImage);

        var base64Image = btoa(rawImage);
        // console.log("Base64: ");
        // console.log(base64Image);

        var imageDataURL = "data:image/jpeg;base64," + base64Image;
        console.log("Image Preview DataURL: ");
        console.log(imageDataURL);

        // Handle Error
        if (xmlHTTP.status != 200) {
            // Call Failed, display error messages.

            // Update Error Message
            // $("#error").append("<span style='color: red;'><br>Unable to retrieve image over internet.</span>");
            $("#error").append("<br>Unable to retrieve image over internet.");
            console.log("Error: Unable to retrieve image over internet.");
            // analyze HTTP status of the response
            console.log(`Error ${xmlHTTP.status}: ${xmlHTTP.statusText}`); // e.g. 404: Not Found
        }
        else { 
            // Success
            console.log("API Call Successful, Loading Image Preview.");
            
            // Load image preview on screen
            document.getElementById("original").src = imageDataURL;
            // Enable image preview as loaded
            $("#original").css("display", "inline-block");

            // Save image in local storage
            // console.log("Saving image preview in local storage");
            // localStorage.setItem("imageDataURL", imageDataURL);
            // localStorage.setItem("imageFieldName", paramImage);
        }
    };

    xmlHTTP.send();
}

function dismiss() {
    // CLOSE Response
    console.log("Begin dismiss()");

    // Create js object that is sent on close
    var payload = {
        apiVersion: 1,
        method: 'close',
        activity: {
            aid: gActivityID
        }
    }

    console.log("Payload to send: ");
    console.log(JSON.stringify(payload));

    window.parent.postMessage(payload, "*");
    console.log("CLOSE Sent");    
}

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

function preResizedImage(event, inject) {
    // var optionsObj = null;

    // Debug
    // paramMaxHeight = 200;
    // paramMaxWidth = 1000;

    console.log("paramMaxHeight: " + paramMaxHeight);
    console.log("paramMaxWidth: " + paramMaxWidth);

    // Calc max height or max width
    // if (originalH > originalW) {
    console.log("H > W: ");
    // Set object to use min/maxHeight
    
    // else {
    //     console.log("H <= W: ");
    //     // Set object to use min/maxWidth
    //     optionsObj = {
    //         maxWidth: paramMaxWidth,
    //         minWidth: paramMaxWidth,
    //         orientation: true 
    //     };
    // }

    // console.log("optionsObj: ");
    // console.log(optionsObj);

    // gSmallDataURL

    var loadingImage = loadImage(
        event.target.files[0],
        function(img) {
            console.log("Start Callback 1");

            // Not running till after resize.
            // document.body.appendChild(img);
            // Save img (canvas) into newResized variable
            gResizeCanvas = img;
            console.log("gResizeCanvas Height = "+ gResizeCanvas.height);
            console.log("gResizeCanvas Width = "+ gResizeCanvas.width);

            var loadingImagePreview = loadImage(
                event.target.files[0],
                function(img) {
                    console.log("Start Callback for Preview Image");
            
                    // Not running till after resize.
                    // document.body.appendChild(img);
                    // Save img (canvas) into newResized variable
                    tempCanvas = img;
                    console.log("gResizeCanvas Height = "+ tempCanvas.height);
                    console.log("gResizeCanvas Width = "+ tempCanvas.width);
            
                    // console.log("newResized");
                    console.log("Image Preview Canvas: ");
                    console.log(img);
                    gSmallDataURL = tempCanvas.toDataURL('image/jpeg');
                    console.log("End Callback");
                },
                { 
                    maxHeight: 1000,
                    minHeight: 1000,
                    orientation: true }); // Options

            if (gResizeCanvas.width > paramMaxWidth) {
                console.log("Resizing again as width is larger than parameter");
                var loadingImage2 = loadImage(
                    event.target.files[0],
                    function(img) {
                        console.log("Start Callback 2");
            
                        // Not running till after resize.
                        // document.body.appendChild(img);
                        // Save img (canvas) into newResized variable
                        gResizeCanvas = img;
                        console.log("gResizeCanvas Height = "+ gResizeCanvas.height);
                        console.log("gResizeCanvas Width = "+ gResizeCanvas.width);
    
                        // console.log("newResized");
                        // console.log(newResized);
                        console.log(img);
                        gResizedDataURL = gResizeCanvas.toDataURL('image/jpeg');
                        console.log("End Callback");
            
                        printOriginalFileSelect(event, inject);
                    },
                    {
                        maxWidth: paramMaxWidth,
                        minWidth: paramMaxWidth,
                        orientation: true 
                    }); // Options

            }
            else {
                // console.log("newResized");
                // console.log("newResized");
                console.log(img);
                gResizedDataURL = gResizeCanvas.toDataURL('image/jpeg');
                console.log("End Callback");

                printOriginalFileSelect(event, inject);
            }
        },
        { maxHeight: paramMaxHeight,
        minHeight: paramMaxHeight,
        orientation: true }); // Options
}

// Read image file and parse/display it's metadata
function printOriginalFileSelect(evt, inject) {

    // Debug
    var debugFiles = evt.target.files
    var debugFilename = debugFiles[0].name
    var debugExtension = debugFiles[0].type

    //$("#debug").append("Debug: Image type = " + debugExtension);

    //$("#debug").append("<br>Debug: Begin image processing");

    // Parameter = File array



    // $("#error").html('');
    
    // // $("#original").css("display", "inline-block");

    // // Show Loading Spinner
    // $("#spinner").css("display", "inline-block");

    // // An image has successfully been selected
    // // Replace erase button with the clear button
    // console.log("Hiding Erase button...");
    // document.getElementById("erase").style.display = "none";
    // console.log("Showing Clear button...");
    // document.getElementById("clear").style.display = "inline-block";

    // // Disable clear button
    // document.getElementById("clear").disabled = true;

    // // Disable both Browse buttons
    // if (document.getElementById("filesCamera")) {
    //     document.getElementById("filesCamera").disabled = true;
    // }
    // document.getElementById("filesBrowse").disabled = true;

    // // Disable Take a Picture
    // if (document.getElementById("camera--trigger")) {
    //     document.getElementById("camera--trigger").disabled = true;            
    // }
    // // Disable Load Canvas Button
    // if (document.getElementById("loadCanvas")) {
    //     document.getElementById("loadCanvas").disabled = true;            
    // }

    // File
    var file = evt.target.files[0]; // FileList object
    
    var reader = new FileReader();
    reader.onload = function(e) {
        //$("#debug").append("<br>Debug: Begin image processing");
        try {
            // Disable submit button
            document.getElementById("submit").disabled = true;
            // Clear fields at start
            $("#error").html("");
            document.querySelector("#resized").src = "";

            // Set global data URL to submit to original image's incase resizing is skipped,
            // it will still be set

            //$("#debug").append("<br>Debug: Set dataURL");
            gDataURL = e.target.result;

            exifObj = piexif.load(e.target.result);
            /* Get Latitude and Longtitude from the  Exif metadata */
            // Latitude
            // console.log("---")
            // latDirection: N

            //$("#debug").append("<br>Debug: Start reading metadata");
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
                // $("#error").css("color", "red");
                $("#error").append("<br>Error: Invalid Latitude Detected");
                gLatLong = null;
            }
            if (ddLong == null) {                
                // $("#error").css("color", "red");
                $("#error").append("<br>Error: Invalid Longtitude Detected");
                gLatLong = null;
            }

            // Output Results
            gLat = ddLat;
            gLong = ddLong;
            gLatLong = ddLatLong;

            /* DateTime */
            // DateTime - 306 field
            // var dateTime = exifObj["0th"]["306"];

            // DateTimeOriginal - 36867 field
            var dateTime = exifObj["Exif"]["36867"];
            if (dateTime == undefined) throw "Error no DateTime Detected";
            
            console.log("------------------------- DATE TIME -------------------------");
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

            //$("#debug").append("<br>Debug: Output metadata");
            // Output Original Image's Metadata
            $("#originalMetadata").html("<h2>Original Metadata</h2>");

            console.log("###EXIF OBJECT: ");
            console.log(exifObj);

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
            // $("#error").append('<span style="color: green;"><br>Success: Metadata Detected<span>');
            $("#error").append('Success: Metadata Detected');

            //$("#debug").append("<br>Debug: Update error messages");

            // Enable submit
            // console.log("Enabling submit button [printOriginalFileSelected]");
            // document.getElementById("submit").disabled = false;
            // Disable spinner
            // $("#spinner").css("display", "none"); 
            // Enable clear button
            // document.getElementById("clear").disabled = false;

        }
        catch(err) {
            // $("#error").css("color", "red");
            //$("#debug").append("<br>Debug: Catch file onload");

            console.log("Error: No/Missing Metadata Detected in Image");
            // $("#error").html("");
            // $("#error").append("No/Missing Metadata Detected in Image, adding metadata");
            hasMetaData = false;
        }
    };
    reader.readAsDataURL(file);

    //$("#debug").append("<br>Debug: End File Onload");

    // Delay as not working without - 500ms too fast if they are quick
    setTimeout(function() {

        //$("#debug").append("<br>Debug: Begin timeout");

        //$("#debug").append("<br>Debug: Begin Resize Conditional");
        if (paramResize == "yes") {
            // resizeFile();
            gDataURL = gResizedDataURL;
        }
        else {
            console.log("***Skip Resizing***");
        }

        //$("#debug").append("<br>Debug: Check Metadata");
        // All must be true to proceed
        if(hasMetaData && gLat != null && gLong != null) {
            console.log("MetaData Found and Ready To Submit");
            if (paramResize == "yes") {
                // Copy exif metadata into resized image.
                // Dump Exif data into bytes for the insert
                var localExifBytes = piexif.dump(exifObj);
                // Insert Exif into the global data url
                gDataURL = piexif.insert(localExifBytes, gDataURL);
                console.log("Injection complete");
            }
            // Image Ready to submit so re-enable submit and hide loader
            // Enable submit
            console.log("Enabling submit button [Timeout / hasMetaData ");
            document.getElementById("submit").disabled = false;
            // Disable spinner
            $("#spinner").css("display", "none"); 
            // Enable clear button
            document.getElementById("clear").disabled = false;
        }
        else {
            // Make sure submit button is still disabled as no metadata
            // console.log("Disabling submit button - as no metadata/gps coordinates invalid");

            console.log("*** No Metadata Detected ***");
            // Parameter passed in to determine if metadata from browser should be injected.

            // Inject if from camera else skip error if checkbox checked else dont
            //$("#debug").append("<br>Debug: Check Inject");

            if (inject) {
                /**** Inject Metadata from Browser into Original Image****/
                console.log("Adding Metadata...");
                // Get Browser Metadata
                console.log("@@@ CALLING GPS @@@");
                //$("#debug").append("<br>Debug: Start getLocation");
                getLocation();
            }
            else {
                //$("#debug").append("<br>Debug: No Image Parameter else");
                console.log("Not Adding Metadata: Displaying Error");

                console.log("ERROR: No Image Parameter Detected");

                // Disable fields as error has been found
                // Disable browse buttons
                document.getElementById("submit").disabled = true;
                // 'Clear' button should still be enabled
                // Disable the camera trigger'Show Camera' button'
                if (document.getElementById("camera--trigger")) {
                    document.getElementById("camera--trigger").disabled = true;
                }
                
                // Update error div
                $("#error").html("");
                // $("#error").css("color", "red");
                $("#error").append("Error: Missing Metadata detected in uploaded image.");

                var browserString = navigator.userAgent.toLowerCase();
                // $("#error").append("<br>Browser String: " + browserString);

                if (browserString.includes("mac os x")) {
                    $("#error").append("<br>This issue can be caused on iPhone 7 & above with iOS 11 and later where the camera settings are not set to Most compatiable. Please ensure the following setting is set:  Settings->Camera->Formats->Most Compatible");
                }
                // else {
                //     $("#error").append("<br>NOT APPLE");
                // }

                //$("#debug").append("<br>Debug: disable spinner (delay)");

                // Disable spinner
                $("#spinner").css("display", "none");
                // Enable clear button
                document.getElementById("clear").disabled = false;
                
                // Show Exception Checkbox

                console.log("File Extension = " + debugExtension);
                if (debugExtension == "image/jpeg" || debugExtension == "image/jpg") {
                    // Show Override
                    $("#exceptionDiv").css("display", "block");
                    console.log("###Valid file");
                    // Disable submit button
                    // document.getElementById("submit").disabled = false;
                }
                else {
                    // Hide Override
                    $("#exceptionDiv").css("display", "none");
                    // Display message
                    $("#error").append("<br>Invalid file type cannot read metadata");
                    console.log("###Invalid file type cannot read metadata");
                }
                console.log("--- SHOWING EXCEPTION DIV ---");
            }
        }
        //$("#debug").append("<br>Debug: End delay");
    }, 3000);
    

}

function getLocation() {
    console.log("Begin getLocation");

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } 
    else {
        console.log("Geolocation is not supported by this browser.");
        // $("#error").html("");
        // $("#error").append("<br><span style='color: red'>Geolocation is not supported by this browser.</span>");
        $("#error").append("<br>Geolocation is not supported by this browser.");
    }
}
function showPosition(position) {
    console.log("Begin showPosition");

    // Enable Browse Button as position has loaded
    // document.getElementById("files").disabled = false;
    // if (document.getElementById("filesCamera")) {
    //     document.getElementById("filesCamera").disabled = false;
    // }
    // document.getElementById("filesBrowse").disabled = false;

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
    // $("#error").append('<span style="color: green">MetaData has successfully been added</span>');
    $("#error").append('MetaData has successfully been added');
    $("#spinner").css("display", "none");

    // var originalImg = document.querySelector("#original");
    // exifObj = piexif.load(originalImg.src);

    if (paramResize == "yes") {
        console.log("**Resizing Browser Metadata Image**");

        // resizeFile();

        var resizedImg = document.querySelector("#resized");
        gDataURL = gResizedDataURL;
        resizedImg.src = gResizedDataURL;

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

    // Replace erase button with the clear button
    console.log("Hiding Erase button...");
    document.getElementById("erase").style.display = "none";
    console.log("Showing Clear button...");
    document.getElementById("clear").style.display = "inline-block";

    // Disable spinner
    $("#spinner").css("display", "none");

    // Enable clear button
    document.getElementById("clear").disabled = false;
    console.log("***Enabling Clear Button 1");

    // Enable submit button
    console.log("Enabling submit button [showposition]");
    document.getElementById("submit").disabled = false;
}

function showError(error) {
    console.log("Begin showError");

    try {
        switch(error.code) {
        case error.PERMISSION_DENIED:
            // User denied the request for Geolocation
            // $("#error").append('<br><span style="color: red;">Error: The request for Geolocation data was denied.</span>');
            $("#error").append('Error: The request for Geolocation data was denied.');
            break;
        case error.POSITION_UNAVAILABLE:
            // $("#error").append('<br><span style="color: red;">Error: Location information is unavailable.<br>Please allow access in "App Permissions" in device settings and restart.</span>');
            $("#error").append('Error: Location information is unavailable.<br>Please allow access in "App Permissions" in device settings and restart.');
            break;
        case error.TIMEOUT:
            // $("#error").append('<br><span style="color: red;">The request for Geolocation data timed out.</span>');
            $("#error").append('The request for Geolocation data timed out.');

            // Show Exception Checkbox
            $("#exceptionDiv").css("display", "block");
            console.log("--- SHOWING EXCEPTION DIV ---");
            break;
        case error.UNKNOWN_ERROR:
            // $("#error").append('<br><span style="color: red;">An unknown error occurred.</span>');
            $("#error").append('An unknown error occurred when retrieving user location');
            break;
        }
        // Location failed so stop spinner
        $("#spinner").css("display", "none");
        // Disable the Submit button
        document.getElementById("submit").disabled = true;
        // Enable the Clear button
        document.getElementById("clear").disabled = false;
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

        // New Write Changes- 4/5 date fields were being written to
        // Done above - DateTime
        // Done above - DateTimeOriginal
        zerothIfd[piexif.ImageIFD.PreviewDateTime] = gDateTime;
        // Done above - DateTimeDigitized
        // Done above - GPSDateStamp

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

        // NEW - PreviewDateTime
        if (exifObj["0th"][piexif.ImageIFD.PreviewDateTime] != undefined) {
            console.log("$PreviewDateTime detected, leave");
        }
        else {
            console.log("$No PreviewDateTime detected, add");
            exifObj["0th"][piexif.ImageIFD.PreviewDateTime] = gDateTime;
        }
        console.log(exifObj["0th"][piexif.ImageIFD.PreviewDateTime]);

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
        img.src = e.target.result;
        // Set the original image to the dataurl
        originalImg.src = e.target.result;

        // Enable image preview as loaded
        $("#original").css("display", "inline-block");
    }
    reader.readAsDataURL(f);
}

function clearImage() {
    console.log("Image cleared");

    // Clear debug
    $("#debug").html("");

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

    // Replace clear button with the erase button
    console.log("Hiding Clear button...");
    document.getElementById("clear").style.display = "none";
    console.log("Showing Erase button...");
    document.getElementById("erase").style.display = "inline-block";

    // Reset and enable the browse.. buttons
    if ($("#fileform1")[0]) {
        $("#fileform1")[0].reset();
    }
    $("#fileform2")[0].reset();

}

function resizeFile() {
    //$("#debug").append("<br>Debug: Begin resizeFile()");
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
    //$("#debug").append("<br>Debug: Begin resize()");
    resizedImg.src = resize(gDataURL, height, width);
    //$("#debug").append("<br>Debug: End resize()"); 

    /* Copy the Original Image's metadata into the Resized Image */

    // exifObj has already been set by getLocation()
    // getLocation();

    //$("#debug").append("<br>Debug: Begin try/catch where error is.");
    
        // Override the pixelX and pixelY fields in the original image's exifObject
        exifObjEditted = overrideDimensions(exifObj, resizedW, resizedH);
        // Dump the exifObject back into bytes
        var exifEdittedBytes = piexif.dump(exifObjEditted);
        // Combine the bytes of the original image's exifObject into the resized image's dataURL,
        // returning a new dataURL

        // DEBUG:
        // console.log("exifEdittedBytes: ");
        // console.log(exifEdittedBytes);

        var resizedEdittedURL = piexif.insert(exifEdittedBytes, gDataURL);

        // console.log("Exif !! - end of resized()");
        // console.log(exifObj);

        // Save the finished resized image's dataURL to the global variable 
        gDataURL = resizedEdittedURL;

        // Complete - Enable Submit Button
        printResizedCopyFileSelect(resizedEdittedURL, "Resized Metadata");
        //$("#debug").append("<br>Debug: try/catch succeeded");
    // }
    // catch(error) {
    //     //$("#debug").append("<br>Debug: try/catch error caught");

    //     $("#error").append('Error processing Image. (Invalid File Type [PNG])');

    //     // Disable spinner
    //     $("#spinner").css("display", "none");

    //     console.log("Enabling submit button [resizeFile()]");
    //     // // Enable submit button
    //     document.getElementById("submit").disabled = false;
    // }
    // //$("#debug").append("<br>Debug: End try/catch where error is.");
}

function resize(inDataURL, wantedHeight, wantedWidth) {
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

    // // Create a new canvas
    // var canvas = document.createElement('canvas');
    // // ctx is still part of the canvas
    // var ctx = canvas.getContext('2d');
    // // Set the canvas to the wanted dimensions
    // canvas.height = outputHeight;
    // canvas.width = outputWidth;

    // // Draw the image to the same dimensions wanted (also same as the canvas)
    // // drawImage(img,x,y,width,height);
    // ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // // Clear the dimensions div incase of consecutive uploads
    // $("#resized-xy").html("");
    // $("#resized-xy").append("Resized Image Dimensions: " + canvas.width + " x " + canvas.height);

    // // Save the resized image height in global variables
    // resizedW = canvas.width;
    // resizedH = canvas.height;

    // // Get and return the DataUrl
    // var dataURL = canvas.toDataURL('image/jpeg');

    // console.log("Calling loadImage()");
    // var newResized = null;

    // var loadingImage = loadImage(
    //     inDataURL,
    //     function(img) {
    //         console.log("Start Callback");
    //         // Not running till after resize.
    //         document.body.appendChild(img);
    //         // Save img (canvas) into newResized variable
    //         newResized = img;
    //         console.log("newResized");
    //         console.log(img);
    //         console.log("End Callback");
    //     },
    //     { maxHeight: outputHeight,
    //     maxWidth: outputWidth,
    //     orientation: true } // Options
    // );
    
    // console.log("Start of code after callback");

    // console.log("newResized: ");
    // console.log(newResized);
    
    // var outDataURL = newResized.toDataURL('image/jpeg');
    // console.log("outDataURL: ");
    // console.log(outDataURL);

    // console.log("Returning from resize()");

    // gDataURL = outDataURL;
    // console.log("End of code after callback");
    // return outDataURL;
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

    // Disable Load Canvas Button
    if (document.getElementById("loadCanvas")) {
        document.getElementById("loadCanvas").disabled = true;            
    }

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
        track = stream.getTracks()[0];
        cameraView.srcObject = stream;
    })
    .catch(function(error) {
        console.error("Error: Unable to access camera", error);
        console.log("Error: Unable to access camera", error);

        // $("#camera--text").append('<br><span style="color: red">Error: Unable to access camera.<br>Please allow access in "App Permissions" in device settings and restart.</span>');
        $("#camera--text").append('<br>Error: Unable to access camera.<br>Please allow access in "App Permissions" in device settings and restart.');
    });

    $("#camera--view").css("display", "inline");
    document.getElementById("camera--trigger").disabled = false;
}

// Take a picture when cameraTrigger is tapped
if (cameraTrigger) {

    cameraTrigger.onclick = function() {
        // Disable browse buttons till finished
        // '#filesCamera' Does not exist on android app
        if (document.getElementById("filesCamera")) {
            document.getElementById("filesCamera").disabled = true;          
        }
        document.getElementById("filesBrowse").disabled = true;

        // Disable Take a Picture
        if (document.getElementById("camera--trigger")) {
            document.getElementById("camera--trigger").disabled = true;            
        }
        
        $("#spinner").css("display", "inline-block");

        $("#camera--text").html("");
        // $("#camera--text").append('<span style="color: green">Picture Taken!</span>');
        $("#camera--text").append('Picture Taken!');

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

            // //$("#debug").append("<br>* Original W: " + originalW);
            // //$("#debug").append("<br>* Original H: " + originalH);

            console.log("Image Loaded: x=" + originalW + ", y=" + originalH);

            console.log("Setting original and resized image to canvas");
            originalImg.src = jpegData;
            // Enable image preview as loaded
            $("#original").css("display", "inline-block");
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

        // Enable browse buttons as finished - not needed for some reason
        // document.getElementById("filesCamera").disabled = false;
        // document.getElementById("filesBrowse").disabled = false;

        // Erase and clear logic must be inside getLocation()
    };
}

document.getElementById("exception").onclick = function() {
    console.log("Checkbox Clicked!");
    console.log("Checkbox Value = " + $('#exception').is(':checked'));

    if ($('#exception').is(':checked')) {
        // Checked
        console.log("Exception Checked");
        console.log("Enabling submit button [exception onclick]");
        document.getElementById("submit").disabled = false;
    }
    else {
        // Unchecked
        console.log("Exception Unchecked");
        document.getElementById("submit").disabled = true;
    }
}


// Start the video stream when the window loads
// window.addEventListener("load", cameraStart, false);
if (document.getElementById("loadCanvas")) {
    document.getElementById("loadCanvas").addEventListener("click", cameraStart, false);
}