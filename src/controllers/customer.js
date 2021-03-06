/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
const mongoose = require('mongoose')
const Customer = require('../models/customer')
const Door = require('../models/door')
const { MongooseError, ConflictError, NotFoundError } = require('../errors')

const logger = require('../../logger')

class CustomerController {
	static async createCustomer(req, res, next) {
		logger.info('[+] CONTROLLER - createCustomer  =>  Handle request')
		const { name, surname, email, password, phone } = req.body

		Customer.find({ email })
			.exec()
			.then((customer) => {
				if (customer.length >= 1) {
					next(new ConflictError('Customer email already exist'))
				}
			})
			.then(() => {
				const customer = new Customer({
					_id: new mongoose.Types.ObjectId(),
					name,
					surname,
					email,
					password,
					phone,
				})
				return customer.save()
			})
			.then((doc) => {
				res.status(201).json({
					status: 'success',
					message: 'created',
					customer: {
						// eslint-disable-next-line no-underscore-dangle
						id: doc._id,
						name: doc.name,
						surname: doc.surname,
						email: doc.email,
					},
				})
			})
			.catch((err) => {
				next(new MongooseError(err.code, err.message))
			})
	}

	static async getAllCustomers(req, res, next) {
		logger.info('[+] CONTROLLER - getAllCustomers  =>  Handle request')

		Customer.find()
			.then((customers) => {
				res.status(200).json({
					status: 'success',
					message: 'created',
					customers,
				})
			})
			.catch((error) => {
				next(new MongooseError(error.code, error.message))
			})
	}

	static async getCustomer(req, res, next) {
		logger.info('[+] CONTROLLER - getCustomer  =>  Handle request')

		Customer.findById(req.params.customerID)
			.then((customer) => {
				if (customer === null) return next(new NotFoundError())
				res.status(200).json({
					status: 'success',
					message: 'success',
					customer,
				})
			})
			.catch((err) => {
				next(new MongooseError(err.code, err.message))
			})
	}

	static async updateCustomer(req, res, next) {
		logger.info('[+] CONTROLLER - getCustomer  =>  Handle request')

		const filter = { _id: mongoose.Types.ObjectId(req.params.customerID) }
		const update = { $set: req.body.updateParams }

		Customer.findOneAndUpdate(filter, update, {
			new: true,
		})
			.then((customer) => {
				res.status(200).json({ status: 'success', message: 'updated', customer })
			})
			.catch((err) => {
				next(new MongooseError(err.code, err.message))
			})
	}

	static async deleteCustomer(req, res, next) {
		logger.info('[+] CONTROLLER - deleteCustomer  =>  Handle request')

		Customer.findOneAndDelete({ _id: mongoose.Types.ObjectId(req.params.customerID) })
			.then(() => {
				res.status(200).json({ status: 'success', message: 'deleted' })
			})
			.catch((err) => {
				next(new MongooseError(err.code, err.message))
			})
	}

	static async getLocksOfUser(req, res, next) {
		logger.info('[+] CONTROLLER - get locks of user  =>  Handle request')

		Door.find({ users: { $in: req.params.customerID } })
			.then((doc) => {
				const result = doc.map((door, doorIndex) => ({ id: door._id, name: door.name, status: door.status }))
				res.status(200).json({ locks: result })
			})
			.catch((err) => {
				res.status(500).json({
					status: 'failed',
					message: 'An error occurred while processing getLocksOfUser controller',
				})
			})
	}
}

module.exports = CustomerController
