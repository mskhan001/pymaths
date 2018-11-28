if(process.env.NODE_ENV === 'production'){
	module.exports = {mongoURI: 'mongodb://pymathsuser:pymaths123@ds119422.mlab.com:19422/pymaths'}
} else {
	module.exports = {mongoURI: 'mongodb://localhost/pymaths'}
}