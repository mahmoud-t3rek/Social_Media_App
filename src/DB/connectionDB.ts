import mongoose from "mongoose";


const ConnectionDB=()=>{
    mongoose.connect(process.env.DB_URL as unknown as string).then(()=>{
        console.log("connect success..............✌️ 💙");
    }).catch(()=>{
        console.log("faild connect...........🤦‍♂️"); 
    })
}
export default ConnectionDB