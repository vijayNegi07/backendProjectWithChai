class ApiResponse{
    constructor(statusCode, message, data){
        this.statusCode = statusCode,
        this.message = `${statusCode}`.startsWith('4') ? 'fail' : 'Success',
        this.success = statusCode < 400;
    }
}

export {ApiResponse};