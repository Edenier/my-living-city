const passport = require('passport');
const { PrismaClient } = require('@prisma/client')

const express = require('express');
const commentRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { includes } = require('lodash');
const { checkIfUserIsLoggedIn } = require('../middlewares/checkAuth');
const { compareCommentsBasedOnLikesAndDislikes } = require('../lib/sortingFunctions');

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
        details: {
          errorMessage: error.message,
          errorStack: error.stack,
        }
			})
    }
  }
)

commentRouter.get(
  '/getall',
  async (req, res, next) => {
    try {
      const allIdeaComments = await prisma.ideaComment.findMany();

      res.status(200).json(allIdeaComments);
    } catch (error) {
      res.status(400).json({
        message: "An error occured while trying to fetch all Idea Comments.",
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

// Get all under idea id
commentRouter.get(
  '/getall/:ideaId',
  checkIfUserIsLoggedIn,
  async (req, res, next) => {
    try {
      const loggedInUser = req.user;
      const parsedIdeaId = parseInt(req.params.ideaId);

      // TODO: check if prisma exists for like under comment under userId
      // TODO: check if prisma exists dislike under comment under userId
      console.log("route")
      console.log('\n\nINSIDE ROUTER', req.user);

      // check if id is valid
      if (!parsedIdeaId) {
        return res.status(400).json({
          message: `A valid ideaId must be specified in the route paramater.`,
        });
      }

      const prismaLikesAndDislikesQuery = {
        likes: {
          where: {
            authorId: loggedInUser?.id
          }
        },
        dislikes: {
          where: {
            authorId: loggedInUser?.id
          }
        }
      }

      const comments = await prisma.ideaComment.findMany({
        where: { ideaId: parsedIdeaId },
        include: {
          _count: {
            select: {
              likes: true,
              dislikes: true,
            }
          },
          author: {
            select: {
              id: true,
              email: true,
              fname: true,
              lname: true,
              address: {
                select: {
                  streetAddress: true,
                  postalCode: true,
                }
              }
            }
          },
          ...loggedInUser && { ...prismaLikesAndDislikesQuery }
        },
        orderBy: [
          {
            likes: {
              count: 'desc'
            }
          },
          {
            updatedAt: 'desc'
          }
        ]
      });

      const result = comments.map(comment => ({
        ...comment,
        likes: comment.likes ?? [],
        dislikes: comment.dislikes ?? [],
      }))

      result.sort(compareCommentsBasedOnLikesAndDislikes);

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(400).json({
        message: `An error occured while trying to fetch all comments under idea ${req.params.ideaId}.`,
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

// Create a comment under an idea
commentRouter.post(
  '/create/:ideaId',
	passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { email, id: loggedInUserId } = req.user;
      const { content } = req.body;
      const parsedIdeaId = parseInt(req.params.ideaId);

      // check if id is valid
      if (!parsedIdeaId) {
        return res.status(400).json({
          message: `A valid ideaId must be specified in the route paramater.`,
        });
      }

      const foundIdea = await prisma.idea.findUnique({ where: { id: parsedIdeaId }});
      if (!foundIdea) {
        return res.status(400).json({
          message: `The idea with that listed ID (${ideaId}) does not exist.`,
        });
      }

      const createdComment = await prisma.ideaComment.create({
        data: {
          content,
          authorId: loggedInUserId,
          ideaId: parsedIdeaId,
        },
        include: {
          author: {
            select: {
              email: true,
              fname: true,
              lname: true,
            }
          }
        }
      })

      res.status(200).json(createdComment);
    } catch (error) {
      res.status(400).json({
        message: `An error occured while trying to create a comment for idea ${req.params.ideaId}.`,
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

// Create a comment under an idea
commentRouter.put(
  '/update/:commentId',
	passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { email, id: loggedInUserId } = req.user;
      const { content } = req.body;
      const parsedCommentId = parseInt(req.params.commentId);

      // check if id is valid
      if (!parsedCommentId) {
        return res.status(400).json({
          message: `A valid commentId must be specified in the route paramater.`,
        });
      }

      // Check to see if comment exists
      const foundComment = await prisma.ideaComment.findUnique({ where: { id: parsedCommentId }});
      if (!foundComment) {
        return res.status(400).json({
          message: `The comment with the listed ID (${commentId}) does not exist.`,
        });
      }

      // Check if comment is requestee's comment
      const commentOwnedByUser = foundComment.authorId === loggedInUserId;
      if (!commentOwnedByUser) {
        return res.status(401).json({
          message: `The user ${email} is not the author or an admin and therefore cannot edit this comment.`
        });
      }

      // Conditional add params to update only fields passed in 
      const updateData = {
        ...content && { content }
      };

      const updatedComment = await prisma.ideaComment.update({
        where: { id: parsedCommentId },
        data: updateData
      });

      res.status(200).json({
        message: "Comment succesfully updated",
        comment: updatedComment,
      });
    } catch (error) {
      res.status(400).json({
        message: `An error occured while trying to edit comment ${req.params.commentId}.`,
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

// delete a comment
commentRouter.delete(
  '/delete/:commentId',
	passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { email, id: loggedInUserId } = req.user;
      const parsedCommentId = parseInt(req.params.commentId);

      // check if id is valid
      if (!parsedCommentId) {
        return res.status(400).json({
          message: `A valid commentId must be specified in the route paramater.`,
        });
      }

      // Check to see if comment exists
      const foundComment = await prisma.ideaComment.findUnique({ where: { id: parsedCommentId }});
      if (!foundComment) {
        return res.status(400).json({
          message: `The comment with the listed ID (${commentId}) does not exist.`,
        });
      }

      // Check if comment is requestee's comment
      const commentOwnedByUser = foundComment.authorId === loggedInUserId;
      if (!commentOwnedByUser) {
        return res.status(401).json({
          message: `The user ${email} is not the author or an admin and therefore cannot delete this comment.`
        });
      }

      const deletedComment = await prisma.ideaComment.delete({ where: { id: parsedCommentId }});

      res.status(200).json({
        message: "Comment succesfully deleted",
        deletedComment: deletedComment,
      });
    } catch (error) {
      res.status(400).json({
        message: `An error occured while trying to delete comment ${req.params.commentId}.`,
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


commentRouter.get(
  '/aggregate/:ideaId',
  async (req, res, next) => {
    try {
      const parsedIdeaId = parseInt(req.params.ideaId);
      const aggregations = await prisma.ideaComment.aggregate({
        where: { ideaId: parsedIdeaId },
        count: {
          _all: true,
        }
      })
      const result = {
        count: aggregations.count._all,
      }
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: `An error occured while trying to check the comments of idea #${req.params.ideaId}.`,
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


module.exports = commentRouter;