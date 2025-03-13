class apiError extends Error {
    constructor(
        statuseCode,
        message = "somthing went wrong",
        errors = [],
        stack = "",

        
    )
    {
        super(message);
        this.statuseCode = statuseCode
        this.data = null 
        this.message = message
        this.sucess = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { apiError };
