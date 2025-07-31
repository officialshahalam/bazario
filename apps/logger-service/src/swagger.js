import swaggerAutogen from "swagger-autogen";

const doc={
   info:{
      title:"Logger Service Api",
      description:"Automatically generate swagger docs",
      version:"1.0.0"
   },
   host:"localhost:4000/logger/api",
   schemes:['http']
}

const outputFile="./swagger-output.json";
const endpointsFiles=["./routes/logger.routes.ts"];

swaggerAutogen()(outputFile,endpointsFiles,doc);