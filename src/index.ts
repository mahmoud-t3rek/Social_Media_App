import {resolve} from 'path';
import {config} from 'dotenv';
config({path:resolve("./config/.env")})

import express from  'express'
import bootstrap from './app.controller';
const app = express()
const port:string |Number = process.env.PORT || 5000
bootstrap(app)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
     