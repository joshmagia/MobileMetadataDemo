/*
Template:
var config  = {
    RESIZE: 'yes',
    RESIZE_MAX_WIDTH: 1000,
    RESIZE_MAX_HEIGHT: 1000,
    FILE_NAME: 'upload'
}
*/

var config  = {
    // Default values
    // passing as parameters in OFSC will override these values
    RESIZE: 'yes',
    RESIZE_MAX_WIDTH: '1000',
    RESIZE_MAX_HEIGHT: '1000',

    // Do not add a file extension
    FILE_NAME: 'capture_image',

    // Height that the 'canvas camera' will capture an image at. i.e. 720p, 1080p
    IMAGE_HEIGHT: 720
}