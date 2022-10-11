const userModel = require("../models/userModel.js")
const validation = require("../validation/validator")
const aws = require("../Aws/aws.js")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')


const createUser = async function (req, res) {
    try {
        let data = req.body;
        let { fname, lname, email, password, phone, address } = data
        let files = req.files
  
        if (validation.isValidBody(data)) return res.status(400).send({ status: false, msg: "please provide  details" })
  
        if (!validation.isValid(fname)) return res.status(400).send({ status: false, message: "first name is required or not valid" })
        if (!validation.isValidName(fname)) return res.status(400).send({ status: false, message: "first name is not valid" })
  
        if (!validation.isValid(lname)) return res.status(400).send({ status: false, message: "last name is required or not valid" })
        if (!validation.isValidName(lname)) return res.status(400).send({ status: false, message: "last name is not valid" })
  
  
        if (!validation.isValid(email)) return res.status(400).send({ status: false, message: "email is required or not valid" })
  
        if (!validation.isValidEmail(email)) return res.status(400).send({ status: false, message: "email is not valid" })
  
        let checkEmail = await userModel.findOne({ email: email })
  
        if (checkEmail) return res.status(409).send({ status: false, msg: "email already exist" })
  
  
  
        if (!validation.isValid(password)) return res.status(400).send({ status: false, message: "Pasworrd is required or not valid" })
  
        if (!validation.isValidPwd(password)) return res.status(400).send({ status: false, message: "Password length should be 8 to 15 digits and enter atleast one uppercase also one special character" })
  
  
  
        if (!validation.isValid(phone)) return res.status(400).send({ status: false, message: "phone is required or not valid" })
  
        if (!validation.isValidNum(phone)) return res.status(400).send({ status: false, message: "phone number is not valid" })
  
        let checkPhone = await userModel.findOne({ phone: phone })
  
        if (checkPhone) return res.status(409).send({ status: false, msg: "Phone already exist" })
  
  
        if (!address) return res.status(400).send({ status: false, msg: "address requried" })
        var addresss = JSON.parse(address)
  
  
        if (!validation.isValid(addresss.shipping.street)) return res.status(400).send({ status: false, message: "street field is required or not valid" })
  
        if (!validation.isValid(addresss.shipping.city)) return res.status(400).send({ status: false, message: "city field is required or not valid" })
  
        if (!validation.isValid(addresss.shipping.pincode)) return res.status(400).send({ status: false, message: "pincode field is required or not valid" })
  
        if (!validation.isValidPincode(addresss.shipping.pincode)) return res.status(400).send({ status: false, message: "PIN code should contain 6 digits only " })
  
  
  
  
        if (!validation.isValid(addresss.billing.street)) return res.status(400).send({ status: false, message: "street field is required or not valid" })
  
        if (!validation.isValid(addresss.billing.city)) return res.status(400).send({ status: false, message: "city field is required or not valid" })
  
        if (!validation.isValid(addresss.billing.pincode)) return res.status(400).send({ status: false, message: "pincode field is required or not valid" })
  
        if (!validation.isValidPincode(addresss.billing.pincode)) return res.status(400).send({ status: false, message: "PIN code should contain 6 digits only " })
  
  
  
        if (files && files.length == 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
  
            return res.status(400).send({ msg: "No file found" })
        }
        let uploadedFileURL = await aws.uploadFile(files[0])
  
        data.profileImage = uploadedFileURL
  
        const saltRounds = 10
        const hash = bcrypt.hashSync(password, saltRounds)
        data.password = hash
  
        data.address = addresss
        let createUser = await userModel.create(data)
        return res.status(201).send({ status: true, message: "user created successfully", createUser })
  
    }
    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }
  }



  const loginUser = async function(req,res) {
    try {
        let data = req.body
        if (validation.isValidBody(data)) return res.status(400).send({ status: false, msg: "please provide  details" })
        let {email,password} = data

        if (!validation.isValid(email)) return res.status(400).send({ status: false, message: "email is required or not valid" })
        if (!validation.isValid(password)) return res.status(400).send({ status: false, message: "Pasworrd is required or not valid" })

        let findUser = await userModel.findOne({email:email})
        if(!findUser) return res.status(404).send({status:false,message:"Email is wrong"})

        let bcryptPass = await bcrypt.compare(password,findUser.password)
        if(!bcryptPass) return res.status(404).send({status:false,message:"Password is wrong"})

        let token = jwt.sign({ userId: findUser._id }, "Products-Management", {expiresIn: '1d'});

        res.status(200).send({ status: true, message: "User login successfully", data: { userId: findUser._id, token: token } })



    } catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }
  }

  const getUser = async (req, res) => {
    try{
      let userId = req.params.userId;
    
      //getting the user document
      const user = await userModel.findOne({ _id: userId})
      return res.status(200).send({ status: true, message: 'User Profile Details', data: user})
    }catch (err) {
      res.status(500).send({ status: false, error: err.message})
  }
  }

module.exports = { createUser,loginUser,getUser }