class apiResponse {
    constructor(statusCode, data, message = "seccess"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.sucess = statusCode < 400 // if status code is less than 400 then sucess is true
    }
}

export{ apiResponse }