import swaggerAutogen from "swagger-autogen";

const doc={
   info:{
      title:"Chatting Service Api",
      description:"Automatically generate swagger docs",
      version:"1.0.0"
   },
   host:"localhost:4000/chatting/api",
   schemes:['http']
}

const outputFile="./swagger-output.json";
const endpointsFiles=["./routes/chatting.routes.ts"];

swaggerAutogen()(outputFile,endpointsFiles,doc);