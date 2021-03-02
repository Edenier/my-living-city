const passport = require('passport');
const db = require('../db/models/index');
const Image = db.Image;

const express = require('express');
const imageRouter = express.Router();

imageRouter.get(
  '/',
  async (req, res, next) => {
    try {
      res.json({
        route: 'welcome to Image Router'
      })
    } catch (error) {
			res.status(400).json({
				message: error.message,
				stack: error.stack,
			})
    }
  }
)

module.exports = imageRouter;