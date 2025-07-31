import swaggerAutogen from "swagger-autogen";

const doc={
   info:{
      title:"Notification Service Api",
      description:"Automatically generate swagger docs",
      version:"1.0.0"
   },
   host:"localhost:4000/notification/api",
   schemes:['http']
}

const outputFile="./swagger-output.json";
const endpointsFiles=["./routes/notification.routes.ts"];

swaggerAutogen()(outputFile,endpointsFiles,doc);