import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { inngest } from "../inngest/client.js";

export const signup = async (req, res) => {
    const { email, password, skills = [] } = req.body;
    console.log("signup request:-", req.body);

    if ([email, password].some((field) => field.trim() === "")) {
        return res
            .status(400)
            .json({ success: false, message: "Email or Password missing" });
    }

    try {
        const isUserExist = await User.findOne({ email }).select("-password");

        if (isUserExist) {
            return res
                .status(409)
                .json({ success: false, message: "This email already exist." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            skills,
        }).select("-password");

        await inngest.send({
            name: "user/signup",
            data: {
                email,
            },
        });

        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET
        );

        return res.json({
            user,
            token,
            message: "Signup successfully",
            success: true,
        });
    } catch (error) {
        res.status(500).json({
            error: "Signup failed",
            details: error.message,
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if ([email, password].some((field) => field.trim() === "")) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "email or password are required",
                });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res
                .status(401)
                .json({ success: false, error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET
        );

        return res
            .status(200)
            .cookie("token", token)
            .json({
                user: {
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                    skills: user.skills,
                },
                token,
                message: "Login Successfully",
            });
    } catch (error) {
        console.error("❌ Login failed:-", error);
        return res
            .status(500)
            .json({ error: "Login failed", message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const token = req.header.authorization.split(" ")[1];

        if (!token)
            return res
                .status(401)
                .json({ success: false, error: "Unauthorized" });

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err)
                return res
                    .status(401)
                    .json({ success: false, error: "Unauthorized" });
        });

        return res.json({ message: "Logout successfully" });
    } catch (error) {
        console.log("Logout failed:-", error);
        return res
            .status(500)
            .json({ error: "Logout failed", details: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { skills = [], role, email } = req.body;
        console.table(req.body);

        if (req.user?.role !== "admin") {
            return res.status(403).json({ success: false, error: "Forbidden" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res
                .status(404)
                .json({ success: false, error: "User not found" });
        }

        const updatedUser = await User.findOneAndUpdate(
            { email },
            {
                skills: skills.length ? skills : user.skills,
                role,
            },
            { new: true }
        );

        if (!updatedUser) {
            return res
                .status(500)
                .json({ success: false, message: "Update failed" });
        }

        return res.json({
            message: "User updated successfully",
            success: true,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Update failed",
            details: error.message,
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        if (req.user?.role !== "admin") {
            return res.status(403).json({ success: false, error: "Forbidden" });
        }

        const users = await User.find().select("-password");

        return res.json({
            users,
            message: "Users fetched successfully",
            success: true,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
