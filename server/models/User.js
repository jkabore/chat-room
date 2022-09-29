const mongoose= require('mongoose');
const bcrypt = require("bcrypt")
const{isEmail}=require("validator")
const userSchema= new mongoose.Schema ({
    name:{
        type:String,
        required:[true,"please enter name"]
    },
    email:{
        type:String,
        required:[true,"please enter email"],
        unique:true,
        lowercase:true,
        validate:[isEmail,"Please Enter a valid email address"]
    },
    password:{
        type:String,
        required:[true,"please enter password"],
        minlength:[6," Password should be at least 6 characters"]
    }
}

)

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);

    next()
})
userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const isAuthenticated = await bcrypt.compare(password, user.password);
        if (isAuthenticated) {
            return user;
        }
        throw Error('incorrect pwd');
    }
    throw Error('incorrect email');

}
const User = mongoose.model('user',userSchema);
 module.exports=User  
