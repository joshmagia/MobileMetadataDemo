// 1) Display Original Image from file browser.

// 2) Output its metadata orientation field.

// 3) Create a download link for the image.

var gDataURL;

function uploadedFile(event) {
    var f = event.target.files[0]; // FileList object

    var reader = new FileReader();
    reader.onloadend = function(e) {

        // Create a fake image using the input file to get it height and width
        var img = new Image();
        img.onload = function(){
            originalW = this.width;
            originalH = this.height;

            console.log("originalH: " + originalH);
            console.log("originalW: " + originalW);

            console.log("gDataURL set");
            gDataURL = e.target.result;

            console.log("Calling - restOfLogic");
            restOfLogic(event);
        };
        // Load the fake image otherwise its onload code wont work
        img.src = e.target.result;
    }
    reader.readAsDataURL(f);
}

function restOfLogic() {
    // 1) Display Original Image from file browser.
    // DataURI to Exif.
    var localExifObj
    $("#output").html("");

    try {
        localExifObj = piexif.load(gDataURL);

        // 2) Display its metadata orientation field.
        if (localExifObj["0th"][piexif.ImageIFD.Orientation]) {
            $("#output").append(localExifObj["0th"][piexif.ImageIFD.Orientation]);
        }
        else {
            $("#output").append("Orientation Field Not Found");
        }

        // 3) Output Image preview to <img>
        document.querySelector("#original").src = gDataURL;

        // 4) Create a download link for the image.
        $("#downloadLink").attr("href", gDataURL);
    }
    catch (e) {
        $("#output").append("Error: Invalid file type, probably png");
    }
}

// image-orientation: from-image;
function toggleCSS() {
    $("#original").toggleClass("orientation");
}
