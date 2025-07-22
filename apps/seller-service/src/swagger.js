import swaggerAutogen from "swagger-autogen";

const doc={
   info:{
      title:"Seller Service Api",
      description:"Automatically generate swagger docs",
      version:"1.0.0"
   },
   host:"localhost:4000/seller/api",
   schemes:['http']
}

const outputFile="./swagger-output.json";
const endpointsFiles=["./routes/seller.routes.ts"];

swaggerAutogen()(outputFile,endpointsFiles,doc);