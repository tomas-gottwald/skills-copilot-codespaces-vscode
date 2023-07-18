// Create web server

import { Router } from 'express';
var router = Router();
import { json } from 'body-parser';
import { find, create, remove, findById, findByIdAndUpdate, findByIdAndRemove } from '../models/comment';
import { verifyOrdinaryUser, verifyAdmin } from '../verify';

router.use(json());

router.route('/')
    .get(function(req, res, next) {
        find({}, function(err, comments) {
            if (err) throw err;
            res.json(comments);
        });
    })
    .post(verifyOrdinaryUser, function(req, res, next) {
        req.body.author = req.decoded._doc._id;
        create(req.body, function(err, comment) {
            if (err) throw err;
            console.log('Comment created!');
            var id = comment._id;
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });

            res.end('Added the comment with id: ' + id);
        });
    })
    .delete(verifyOrdinaryUser, verifyAdmin, function(req, res, next) {
        remove({}, function(err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });

router.route('/:commentId')
    .get(function(req, res, next) {
        findById(req.params.commentId, function(err, comment) {
            if (err) throw err;
            res.json(comment);
        });
    })
    .put(verifyOrdinaryUser, verifyAdmin, function(req, res, next) {
        findByIdAndUpdate(req.params.commentId, {
            $set: req.body
        }, {
            new: true
        }, function(err, comment) {
            if (err) throw err;
            res.json(comment);
        });
    })
    .delete(verifyOrdinaryUser, verifyAdmin, function(req, res, next) {
        findByIdAndRemove(req.params.commentId, function(err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });

router.route('/:commentId/rate')
    .post(verifyOrdinaryUser, function(req, res, next) {
        findById(req.params.commentId, function(err, comment) {
            if (err) throw err;
            var rates = comment.rates;
            var index = -1;
            for (var i = 0; i < rates.length; i++) {
                if (rates[i].author == req.decoded