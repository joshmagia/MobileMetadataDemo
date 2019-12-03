

function printFileSelect(evt) {
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

        // console.log(e.target.result);
        var exifObj = piexif.load(e.target.result);

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
