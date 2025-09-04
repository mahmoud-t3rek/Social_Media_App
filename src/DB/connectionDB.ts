import mongoose from "mongoose";


const ConnectionDB=()=>{
    mongoose.connect('mongodb://127.0.0.1:27017/SocialApp').then(()=>{
        console.log("connect success..............✌️ 💙");
    }).catch(()=>{
        console.log("faild connect...........🤦‍♂️"); 
    })
}
export default ConnectionDB