const passport = require('passport');

const express = require('express');
const advertisementRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { isEmpty } = require('lodash');
const { UserType } = require('@prisma/client');

advertisementRouter.post(
    '/create',
    passport.authenticate('jwt',{session:false}),
    async(req,res,next) => {
        try{
            //get email and user id from request
            const { email, id } = req.user;
            //find the requesting user in the database
            const theUser = await prisma.user.findUnique({
                where:{id:id},
                select:{userType:true}
            })

            //console.log(theUser.userType);
            //console.log(req)

            //test to see if the user is an admin or business user
            if(theUser.userType=="ADMIN" || theUser.userType=="BUSINESS"){

                let error = '';
                let errorMessage = '';
                let errorStack = '';

                //if there's no object in the request body
                if(isEmpty(req.body)){
                    return res.status(400).json({
                        message: 'The objects in the request body are missing',
                        details: {
                            errorMessage: 'Creating an advertisement must supply necessary fields explicitly.',
                            errorStack: 'necessary fields must be provided in the body with a valid id found in the database.',
                        }
                    })
                }

                //decompose necessary fields from request body
                const {adType,adTitle,adDuration,adPosition,imagePath,externalLink,published} = req.body;

                //if there's no adType in the request body
                if(!adType){
                    error+='An advertisement must has a type. ';
                    errorMessage+='Creating an advertisement must explicitly be supplied with a "adType" field. ';
                    errorStack+='adType must be defined in the body with a valid id found in the database. ';
                }
                
                //if adType is not valid
                if(!(adType=="BASIC"||adType=="EXTRA")){
                    error+='adType is invalid. ';
                    errorMessage+='adType must be predefined value. ';
                    errorStack+='adType must be assigned with predfined value. ';
                }

                //if there's no adTitle field
                if(!adTitle){
                    error+='An advertisement needs a title. ';
                    errorMessage+='Creating an advertisement must explicitly be supplied with a "adTitle" field. ';
                    errorStack+='adTitle must be defined in the body with a valid id found in the database. ';
                }

                //if the content size of adTitle is not valid
                if(adTitle.length <= 2 || adTitle.length >=40){
                    error+='adTitle size is invalid. ';
                    errorMessage+='adTitle length must be longer than 2 and shorter than 40. ';
                    errorStack+='adTitle content size must be valid ';
                }

                //console.log(adTitle.length);

                //if there's no published field in the reqeust body or published field is not valid
                if(!published || !(typeof published === 'boolean')){
                    error+='An published filed must be provided. ';
                    errorMessage+='Creating an idea must explicitly be supplied with a "published" field. ';
                    errorStack+='Published must be defined in the body with a valid value. ';
                }

                //if there's no adDuration field in the request body
                if(!adDuration || adDuration <= 0){
                    error+='adDuration must be provided. ';
                    errorMessage+='adDuration must be provided in the body with a valid length. ';
                    errorStack+='adDuration must be provided in the body with a valid lenght. ';
                }

                //if there's no adPosition field in the 
                if(!adPosition){
                    error+='adPosition is missing. ';
                    errorMessage+='Creating an advertisement must explicitly be supply a adPosition field. ';
                    errorStack+='"adPosition" must be provided in the body with a valid position found in the database. '
                }

                if(error&&errorMessage&&errorStack){
                    return res.status(400).json({
                        message: error,
                        details: {
                          errorMessage: errorMessage,
                          errorStack: errorStack
                        }
                    });
                }

                let theDate = new Date();
                let endDate = new Date();
                endDate.setDate(theDate.getDate()+adDuration);
                //create an advertisement object
                const createAnAdvertisement = await prisma.advertisements.create({
                    data:{
                        ownerId:id,
                        adTitle:adTitle,
                        duration: endDate,
                        adType:adType,
                        adPosition:adPosition,
                        imagePath:imagePath,
                        externalLink:externalLink,
                        published:published
                    }
                });

                //sending user the successfull status with created advertisement object
                res.status(200).json(createAnAdvertisement);
            }else{
                return res.status(403).json({
                    message: "You don't have the right to add an advertisement!",
                    details: {
                      errorMessage: 'In order to create an advertisement, you must be an admin or business user.',
                      errorStack: 'user must be an admin or business if they want to create an advertisement',
                    }
                });
            }
        }catch(error){
            console.log(error);
            res.status(400).json({
                message: "An error occured while trying to create an Advertisement.",
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    }
)

module.exports = advertisementRouter;