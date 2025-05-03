import multer from "multer";

//multer is the middlware used to add the files to the req that was not provided by the express by default
//otherwise we would not able to upload it on the third party services

//returns an multer object 
const storage = multer.diskStorage({
    //specify the destination for the the files to be stored
    destination: function (req, file, cb) {
        //cb is the callback provided by multer
      cb(null, './public/temp')
      //null means the operation does not have the error
    },
    filename: function (req, file, cb) {
        //originalname means the file to be stored with default name provided by the user
      cb(null, file.originalname)
    }
  })
  
  //upload is the middlware created 
  const upload = multer({ storage: storage })

  export {upload};