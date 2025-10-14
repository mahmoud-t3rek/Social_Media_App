import {resolve} from 'path';
import {config} from 'dotenv';
config({path:resolve("./config/.env")})

import express from  'express'
import bootstrap from './app.controller';
import { Server } from 'socket.io';
import { Socket } from 'socket.io';
import { AppError } from './utils/ClassError';
import { Decoded_Token, GetSignutre, TokenType } from './services/Token/Token';
import { HydratedDocument } from 'mongoose';
import { Iuser } from './DB/models/user.model';
import { JwtPayload } from 'jsonwebtoken';

const app = express()

bootstrap(app)


    
