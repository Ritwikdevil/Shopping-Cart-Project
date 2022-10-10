const userModel = require("../models/userModel.js")
const validation = require("../validation/validator")
const aws = require("../Aws/aws.js")
const bcrypt = require("bcrypt")


const createUser = async function(req,res) {
    const data = req.body
    let files = req.files
    let { fname, lname, email, password, profileImage, phone, address } = data

    if(!validation.isValidBody(data)) return res.status(400).send({status:false,message:"please provide input in requestBody"})

    if(!validation.isValid(fname)) return res.status(400).send({status:false,message:"fname is required"})
    if(!validation.validName(fname)) return res.status(400).send({status:false,message:"Please provide valid first name"})

    if(!validation.isValid(lname)) return res.status(400).send({status:false,message:"last name is required"})
    if(!validation.validName(lname)) return res.status(400).send({status:false,message:"Please provide valid last name"})

    if(!validation.isValid(email)) return res.status(400).send({status:false,message:"email is required"})
    if(!validation.isValidEmail(email)) return res.status(400).send({status:false,message:"Please provide valid email"})
    let checkEmail = await userModel.findOne({ email: email })
    if (checkEmail) return res.status(409).send({ status: false, msg: "email already exist"})

    if(!validation.isValid(password)) return res.status(400).send({status:false,message:"password is required"})
    if(!validation.isValidPwd(password)) return res.status(400).send({status:false,message:"Password should contain min of 8 and max of 15 character"})

    if(!validation.isValid(phone)) return res.status(400).send({status:false,message:"phone is required"})
    if(!validation.isValidPhone(phone)) return res.status(400).send({status:false,message:"Please provide valid PhoneNumber"})
    let checkPhone = await userModel.findOne({ phone: phone })
    if (checkPhone) return res.status(409).send({ status: false, msg: "Phone Number already exist" })


    

    



}
