const userModel = require("../models/userModel.js")
const validation = require("../validation/validator")
const aws = require("../Aws/aws.js")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')


const createUser = async function(req,res) {
    try {
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

    if (files.length == 0) return res.status(400).send({ status: false, message: "Please upload profile image" });


    if(!validation.isValid(password)) return res.status(400).send({status:false,message:"password is required"})
    if(!validation.isValidPwd(password)) return res.status(400).send({status:false,message:"Password should contain min of 8 and max of 15 character"})

    if(!validation.isValid(phone)) return res.status(400).send({status:false,message:"phone is required"})
    if(!validation.isValidPhone(phone)) return res.status(400).send({status:false,message:"Please provide valid PhoneNumber"})
    let checkPhone = await userModel.findOne({ phone: phone })
    if (checkPhone) return res.status(409).send({ status: false, msg: "Phone Number already exist" })
  //converting string to JSON
    address = JSON.parse(address)
    if (validation.isValid(address)) return res.status(400).send({ status: false, message: "Address should be in object and must contain shipping and billing addresses" });

    if (validation.isValid(address.shipping)) return res.status(400).send({ status: false, message: "Shipping address should be in object and must contain street, city and pincode" });

    if (validation.isValid(address.shipping.street)) return res.status(400).send({ status: false, message: "Street is required of shipping address and should not be empty string" });

    if (validation.isValid(address.shipping.city)) return res.status(400).send({ status: false, message: "City is required of shipping address and should not be empty string" });

    if (validation.isValid(address.shipping.pincode)) return res.status(400).send({ status: false, message: "Pincode is required of shipping address and should not be an empty string" });

    if (!validation.isValidPincode(address.shipping.pincode)) return res.status(400).send({ status: false, message: "Enter a valid pincode" });

    if (validation.isValid(address.billing)) return res.status(400).send({ status: false, message: "Billing address should be in object and must contain street, city and pincode" });

    if (validation.isValid(address.billing.street)) return res.status(400).send({ status: false, message: "Street is required of billing address and should not be empty string" });

    if (validation.isValid(address.billing.city)) return res.status(400).send({ status: false, message: "City is required of billing address and should not be empty string" })

    if (validation.isValid(address.billing.pincode)) return res.status(400).send({ status: false, message: "Pincode is required of billing address and should not be an empty string" });

    if (!validation.isValidPincode(data.address.billing.pincode)) return res.status(400).send({ status: false, message: "Enter a valid pincode" });

    let profileImgUrl = await uploadFile(files[0]);
    profileImage = profileImgUrl;
    
    //hashing the password with bcrypt
    password = await bcrypt.hash(data.password, 10);

    let responseData = await User.create(data);
    res.status(201).send({ status: true, message: "User created successfully", data: responseData })

}catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}


module.exports = { createUser, }