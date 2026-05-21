/**
 * Starry Night Photobooth — Google Apps Script
 *
 * Deploy as Web App:
 * 1. Extensions → Apps Script
 * 2. Paste this code
 * 3. Set FOLDER_ID to your Google Drive folder ID
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL into config.py (GOOGLE_APPS_SCRIPT_URL)
 */

var FOLDER_ID = "YOUR_GOOGLE_DRIVE_FOLDER_ID";

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify(getPhotosFromFolder()))
    .setMimeType(ContentService.MimeType.JSON);
}

function getPhotosFromFolder() {
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var files = folder.getFiles();
  var photos = [];
  var imageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/heic",
  ];

  while (files.hasNext()) {
    var file = files.next();
    var mime = file.getMimeType();

    if (imageTypes.indexOf(mime) === -1) {
      continue;
    }

    var fileId = file.getId();
    photos.push({
      name: file.getName(),
      url: "https://drive.google.com/uc?export=view&id=" + fileId,
      thumbnail:
        "https://drive.google.com/thumbnail?id=" +
        fileId +
        "&sz=w800",
      createdTime: file.getDateCreated().toISOString(),
    });
  }

  photos.sort(function (a, b) {
    return new Date(b.createdTime) - new Date(a.createdTime);
  });

  return photos;
}
