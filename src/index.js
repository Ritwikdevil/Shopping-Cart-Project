const express = require('express');
const route = require('./routes/route.js');
const { default: mongoose } = require('mongoose')
const multer = require('multer');;
const app = express();

const upload = multer();
app.use(upload.any());
app.use(express.json());


mongoose.connect("mongodb+srv://group47:IzQG26fl0fyXl9IN@cluster0.oxrsqmy.mongodb.net/group47Database?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route)

// app.use((req, res) => {
//     return res.status(400).send({ status: false, message: "End point is incorrect" })
// });


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});