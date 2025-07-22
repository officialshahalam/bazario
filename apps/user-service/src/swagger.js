import swaggerAutogen from "swagger-autogen";

const doc={
   info:{
      title:"User Service Api",
      description:"Automatically generate swagger docs",
      version:"1.0.0"
   },
   host:"localhost:4000/user/api",
   schemes:['http']
}

const outputFile="./swagger-output.json";
const endpointsFiles=["./routes/user.routes.ts"];

swaggerAutogen()(outputFile,endpointsFiles,doc);