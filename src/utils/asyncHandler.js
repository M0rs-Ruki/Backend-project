const asyncHandler = (requesttHandler) => {
    return (req, res, next) => {
        Promise.resolve(requesttHandler(req, res, next)).catch((err) => next(err));
        
    }
};


export { asyncHandler };


