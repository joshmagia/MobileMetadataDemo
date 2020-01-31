/*
Template:
var config  = {
    RESIZE: 'yes',
    RESIZE_MAX_WIDTH: 1000,
    RESIZE_MAX_HEIGHT: 1000,
    FILE_NAME: 'capture_image',
    IMAGE_HEIGHT: 720,
    VERSION_NUMBER: '1.0.0'
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
    IMAGE_HEIGHT: 720,

    // Version number: to be incremented on change
    VERSION_NUMBER: '1.0.99'
}