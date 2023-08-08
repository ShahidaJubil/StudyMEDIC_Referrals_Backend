var express=require('express')
var Image=require('../model/ImageModel')
const router = express.Router();
const multer=require('multer')
const path=require('path')

const storage= multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, './uploads')
    },
    filename: function(req,file,cb){
        cb(null,file.originalname)  //  cb(null,Date.now+file.originalname)
    }
})

const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/jpeg' ||file.mimetype==='image/png'||file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword'){
        cb(null,true)
    }else{
        cb(null,false)
    }
}

const upload=multer({
    storage: storage,
    limits:{
        fileSize:1024 * 1024 * 5
    },
    fileFilter:fileFilter
})

router.route('/upload').post(upload.single('imageData'),(req,res,next)=>{
    console.log(req.body)
    const newImage=new Image({
        fname:req.body.fname,
        lname:req.body.lname,
        email:req.body.email,
        location:req.body.location,
        phone:req.body.phone,
        imageData:req.file.path,
        //fileData:req.file.path
    })
    newImage.save()
    .then((result)=>{
        console.log(result)
        res.status(200).json({
            success:true,
            document:result
        })
    })

    .catch((error)=>{
        next(error)
    })
})

router.route('/get/:id').get((req, res, next) => {
  const imageId = req.params.id;
  Image.findById(imageId)
    .then((image) => {
      if (!image) {
        res.status(404).json({
          success: false,
          message: 'Image not found',
        });
      } else {
        res.status(200).json({
          success: true,
          image: image,
        });
      }
    })
    .catch((error) => {
      next(error);
    });
});
router.route('/get').get((req, res, next) => {
  Image.find()
    .then((images) => {
      res.status(200).json({
        success: true,
        images: images,
      });
    })
    .catch((error) => {
      next(error);
    });
});
router.route('/update/:id').put(upload.single('imageData'), (req, res, next) => {
    const imageId = req.params.id;
    const { fname, lname, email, location, phone } = req.body;
  
    const updateFields = {
      fname,
      lname,
      email,
      location,
      phone,
      
    };
  
    if (req.file) {
      updateFields.imageData = req.file.path;
    }
  
    Image.findByIdAndUpdate(imageId, updateFields, { new: true })
      .then((updatedImage) => {
        if (!updatedImage) {
          res.status(404).json({
            success: false,
            message: 'Image not found',
          });
        } else {
          res.status(200).json({
            success: true,
            image: updatedImage,
          });
        }
      })
      .catch((error) => {
        next(error);
      });
  });
  

module.exports = router;