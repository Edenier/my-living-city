const passport = require('passport');
const db = require('../db/models/index');
const Comment = db.Comment;

const express = require('express');
const commentRouter = express.Router();

commentRouter.get(
  '/',
  async (req, res, next) => {
    try {
      res.json({
        route: 'welcome to comment Router'
      })
    } catch (error) {
			res.status(400).json({
				message: error.message,
				stack: error.stack,
			})
    }
  }
)

module.exports = commentRouter;