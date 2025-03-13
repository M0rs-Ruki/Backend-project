const asyncHandler = (requesttHandler) => {
    (req, res, next) => {
        Promise.resolve(requesttHandler(req, res, next))
        .catch((error) => {})
    }
};


export { asyncHandler };








// const asyncHandler = () => {};


// const asyncHandler = (fn) => async (req, res, next) =>{
//   try {
//     await fin(req, res, next)
//   } catch (error) {
//     res.status(error.code || 500).json({
//         sucess: false,
//         massege: error.massege
//     })
//   }  
// };
