// Wrapper function to handle async operations
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;