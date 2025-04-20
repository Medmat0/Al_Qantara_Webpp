import asyncHandler from "express-async-handler";

/**
 * @desc    Logout user by clearing cookies
 * @method  POST
 * @route   /auth/logout
 * @access  public
 */
const logout = asyncHandler(async (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        // secure: true, // Uncomment in production
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        // secure: true, // Uncomment in production
    });
    res.status(200).json({ message: "Logged out successfully" });
});

export {logout};