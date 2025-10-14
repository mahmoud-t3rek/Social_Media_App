const client=io("http://localhost:3000",{
    auth:{
        authorization:"Admin eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1haG1vdWR0YXJla2syMzZAZ21haWwuY29tIiwiSWQiOiI2OGM2YmQ4NTc5NTZlYWZlM2IyYjVhZDQiLCJpYXQiOjE3NTk5MzIwNjUsImV4cCI6MTc1OTkzNTY2NSwianRpIjoiZWVmNjYxNzYtMjg2MS00MDE3LWIyNTktOTRhZTdlYjdlOWFjIn0.sz-bq_nbk1mqR5JXqIAWTzphmgJVH-JG0xyJJwrQHo4"
}})

client.on("connect",()=>{
    console.log("clinet connect");
    
})

client.on("userdisconnect",(data)=>{
    console.log(data);
    
})

client.emit("sayhay","how is mahmoud",(res)=>{
    console.log(res);
    
}) 