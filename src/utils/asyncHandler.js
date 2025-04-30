const asyncHandler=(func)=>{
    return function(res, res, next){
        Promise.resolve(func(req, res, next)).catch(next);
    }
}

export {asyncHandler};