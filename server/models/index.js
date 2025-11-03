/**
 * Models Index File
 * Export tất cả models để dễ dàng import trong các controllers
 */

const User = require('./User');
const Course = require('./Course');
const Lesson = require('./Lesson');
const Quiz = require('./Quiz');
const Question = require('./Question');
const Order = require('./Order');
const Payment = require('./Payment');

module.exports = {
    User,
    Course,
    Lesson,
    Quiz,
    Question,
    Order,
    Payment
};
