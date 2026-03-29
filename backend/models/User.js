import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
        minlength: [6, 'Password must be at least 6 characters']
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    profilePicture: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) {
        throw new Error('Password not set for this user');
    }
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
