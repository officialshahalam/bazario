import swaggerAutogen from "swagger-autogen";

const doc={
   info:{
      title:"Auth Service Api",
      description:"Automatically generate swagger docs",
      version:"1.0.0"
   },
   host:"localhost:4000",
   schemes:['http']
}

const outputFile="./swagger-output.json";
const endpointsFiles=["./routes/auth.routes.ts"];

swaggerAutogen()(outputFile,endpointsFiles,doc);